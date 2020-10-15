/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/math/CarefulMath.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";

import "./BalanceSheetInterface.sol";
import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";
import "./oracles/OraclePriceScalar.sol";
import "./oracles/UniswapAnchoredViewInterface.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title BalanceSheet
 * @author Mainframe
 */
contract BalanceSheet is
    ReentrancyGuard, /* no depedency */
    Admin, /* two dependencies */
    BalanceSheetInterface /* four dependencies */
{
    using OraclePriceScalar for UniswapAnchoredViewInterface;
    using SafeErc20 for Erc20Interface;

    modifier isVaultOpenForMsgSender(YTokenInterface yToken) {
        require(vaults[address(yToken)][msg.sender].isOpen, "ERR_VAULT_NOT_OPEN");
        _;
    }

    /**
     * @param fintroller_ The address of the Fintroller contract.
     */
    constructor(FintrollerInterface fintroller_) Admin() {
        /* Set the yToken contract and sanity check it. */
        fintroller = fintroller_;
        fintroller.isFintroller();
    }

    /**
     * CONSTANT FUNCTIONS
     */

    struct CalculateClutchableCollateralLocalVars {
        MathError mathErr;
        Exp clutchableCollateralAmountUpscaled;
        uint256 clutchableCollateralAmount;
        uint256 collateralPrecisionScalar;
        uint256 collateralPriceUpscaled;
        uint256 liquidationIncentiveMantissa;
        Exp numerator;
        uint256 oraclePricePrecisionScalar;
        uint256 underlyingPriceUpscaled;
    }

    /**
     * @notice Determines the amount of collateral that can be clutched when liquidating a borrow.
     *
     * @dev The formula applied is:
     * clutchedCollateral = repayAmount * liquidationIncentive * underlyingPriceUsd / priceCollateralUsd
     *
     * Requirements:
     *
     * - `repayAmount` must be non-zero.
     *
     * @param yToken The yToken to make the query against.
     * @param repayAmount The amount of yTokens to repay.
     * @return The amount of clutchable collateral as uint256, specified in the collateral's decimal system.
     */
    function getClutchableCollateral(YTokenInterface yToken, uint256 repayAmount)
        external
        view
        override
        returns (uint256)
    {
        CalculateClutchableCollateralLocalVars memory vars;

        /* Avoid the zero edge cases. */
        require(repayAmount > 0, "ERR_GET_CLUTCHABLE_COLLATERAL_ZERO");

        /* When the liquidation incentive is zero, the end result would be zero anyways. */
        vars.liquidationIncentiveMantissa = fintroller.liquidationIncentiveMantissa();
        if (vars.liquidationIncentiveMantissa == 0) {
            return 0;
        }

        /* Grab the upscaled USD price of the underlying. */
        UniswapAnchoredViewInterface oracle = fintroller.oracle();
        vars.oraclePricePrecisionScalar = fintroller.oraclePricePrecisionScalar();
        (vars.mathErr, vars.underlyingPriceUpscaled) = oracle.getScaledPrice(
            yToken.underlying().symbol(),
            vars.oraclePricePrecisionScalar
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_CLUTCHABLE_COLLATERAL_MATH_ERROR");

        /* Grab the upscaled USD price of the collateral. */
        (vars.mathErr, vars.collateralPriceUpscaled) = oracle.getScaledPrice(
            yToken.collateral().symbol(),
            vars.oraclePricePrecisionScalar
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_CLUTCHABLE_COLLATERAL_MATH_ERROR");

        /* Calculate the top part of the equation. */
        (vars.mathErr, vars.numerator) = mulExp3(
            Exp({ mantissa: repayAmount }),
            Exp({ mantissa: vars.liquidationIncentiveMantissa }),
            Exp({ mantissa: vars.underlyingPriceUpscaled })
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_CLUTCHABLE_COLLATERAL_MATH_ERROR");

        /* Calculate the mantissa form of the clutched collateral amount. */
        (vars.mathErr, vars.clutchableCollateralAmountUpscaled) = divExp(
            vars.numerator,
            Exp({ mantissa: vars.collateralPriceUpscaled })
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_CLUTCHABLE_COLLATERAL_MATH_ERROR");

        /* If the precision scalar is not 1, calculate the final form of the clutched collateral amount. */
        vars.collateralPrecisionScalar = yToken.collateralPrecisionScalar();
        if (vars.collateralPrecisionScalar != 1) {
            (vars.mathErr, vars.clutchableCollateralAmount) = divUInt(
                vars.clutchableCollateralAmountUpscaled.mantissa,
                vars.collateralPrecisionScalar
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_CLUTCHABLE_COLLATERAL_MATH_ERROR");
        } else {
            vars.clutchableCollateralAmount = vars.clutchableCollateralAmountUpscaled.mantissa;
        }

        return vars.clutchableCollateralAmount;
    }

    /**
     * @notice Determines the current collateralization ratio for the given account;
     * @param yToken The yToken to make the query against.
     * @param account The account to make the query against.
     * @return A quotient if locked collateral is non-zero, otherwise zero.
     */
    function getCurrentCollateralizationRatio(YTokenInterface yToken, address account)
        public
        view
        override
        returns (uint256)
    {
        Vault memory vault = vaults[address(yToken)][account];
        return getHypotheticalCollateralizationRatio(yToken, account, vault.lockedCollateral, vault.debt);
    }

    struct GetHypotheticalAccountLiquidityLocalVars {
        MathError mathErr;
        uint256 collateralPriceUpscaled;
        uint256 collateralPrecisionScalar;
        uint256 collateralizationRatioMantissa;
        Exp debtValueUsd;
        Exp hypotheticalCollateralizationRatio;
        Exp lockedCollateralValueUsd;
        uint256 lockedCollateralUpscaled;
        uint256 oraclePricePrecisionScalar;
        uint256 underlyingPriceUpscaled;
        uint256 underlyingPrecisionScalar;
    }

    /**
     * @notice Determines the hypothetical account collateralization ratio for the given locked
     * collateral and debt, at the current prices provided by the oracle.
     *
     * @dev The formula applied is: collateralizationRatio = lockedCollateralValueUsd / debtValueUsd
     *
     * Requirements:
     *
     * - The vault must be open.
     * - `debt` must be non-zero.
     * - The oracle prices must be non-zero.
     *
     * @param yToken The yToken for which to make the query against.
     * @param account The account for which to make the query against.
     * @param lockedCollateral The hypothetical locked collateral.
     * @param debt The hypothetical debt.
     * @return The hypothetical collateralization ratio as a percentage mantissa if locked
     * collateral is non-zero, otherwise zero.
     */
    function getHypotheticalCollateralizationRatio(
        YTokenInterface yToken,
        address account,
        uint256 lockedCollateral,
        uint256 debt
    ) public view override returns (uint256) {
        GetHypotheticalAccountLiquidityLocalVars memory vars;

        /* If the vault is not open, a hypothetical collateralization ratio cannot be calculated. */
        require(vaults[address(yToken)][account].isOpen, "ERR_VAULT_NOT_OPEN");

        /* Avoid the zero edge cases. */
        if (lockedCollateral == 0) {
            return 0;
        }
        require(debt > 0, "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_DEBT_ZERO");

        /* Grab the upscaled USD price of the collateral. */
        UniswapAnchoredViewInterface oracle = fintroller.oracle();
        vars.oraclePricePrecisionScalar = fintroller.oraclePricePrecisionScalar();
        (vars.mathErr, vars.collateralPriceUpscaled) = oracle.getScaledPrice(
            yToken.collateral().symbol(),
            vars.oraclePricePrecisionScalar
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_MATH_ERROR");

        /* Grab the upscaled USD price of the underlying. */
        (vars.mathErr, vars.underlyingPriceUpscaled) = oracle.getScaledPrice(
            yToken.underlying().symbol(),
            vars.oraclePricePrecisionScalar
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_MATH_ERROR");

        /* Upscale the collateral, which can have any precision, to mantissa precision. */
        vars.collateralPrecisionScalar = yToken.collateralPrecisionScalar();
        if (vars.collateralPrecisionScalar != 1) {
            (vars.mathErr, vars.lockedCollateralUpscaled) = mulUInt(lockedCollateral, vars.collateralPrecisionScalar);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_MATH_ERROR");
        } else {
            vars.lockedCollateralUpscaled = lockedCollateral;
        }

        /* Calculate the USD value of the collateral. */
        (vars.mathErr, vars.lockedCollateralValueUsd) = mulExp(
            Exp({ mantissa: vars.lockedCollateralUpscaled }),
            Exp({ mantissa: vars.collateralPriceUpscaled })
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_MATH_ERROR");

        /* Calculate the USD value of the debt. */
        (vars.mathErr, vars.debtValueUsd) = mulExp(
            Exp({ mantissa: debt }),
            Exp({ mantissa: vars.underlyingPriceUpscaled })
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_MATH_ERROR");

        /**
         * Calculate the collateralization ratio by dividing the USD value of the hypothetical locked collateral by
         * the USD value of the debt.
         */
        (vars.mathErr, vars.hypotheticalCollateralizationRatio) = divExp(
            vars.lockedCollateralValueUsd,
            vars.debtValueUsd
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_MATH_ERROR");

        return vars.hypotheticalCollateralizationRatio.mantissa;
    }

    /**
     * @notice Reads all the properties of a vault.
     */
    function getVault(YTokenInterface yToken, address account)
        external
        view
        override
        returns (
            uint256 debt,
            uint256 freeCollateral,
            uint256 lockedCollateral,
            bool isOpen
        )
    {
        debt = vaults[address(yToken)][account].debt;
        freeCollateral = vaults[address(yToken)][account].freeCollateral;
        lockedCollateral = vaults[address(yToken)][account].lockedCollateral;
        isOpen = vaults[address(yToken)][account].isOpen;
    }

    /**
     * @notice Reads the debt held by the given account.
     */
    function getVaultDebt(YTokenInterface yToken, address account) external view override returns (uint256) {
        return vaults[address(yToken)][account].debt;
    }

    /**
     * @notice Reads the collateral that the given account locked in the vault.
     */
    function getVaultLockedCollateral(YTokenInterface yToken, address account)
        external
        view
        override
        returns (uint256)
    {
        return vaults[address(yToken)][account].lockedCollateral;
    }

    /**
     * @notice Checks whether the account can be liquidated or not.
     * @param yToken The yToken for which to make the query against.
     * @param account The account for which to make the query against.
     * @return true = is underwater, otherwise not.
     */
    function isAccountUnderwater(YTokenInterface yToken, address account) external view override returns (bool) {
        Vault memory vault = vaults[address(yToken)][account];
        if (!vault.isOpen || vault.debt == 0) {
            return false;
        }
        uint256 currentCollateralizationRatioMantissa = getCurrentCollateralizationRatio(yToken, account);
        uint256 thresholdCollateralizationRatioMantissa = fintroller.getBondCollateralizationRatio(yToken);
        return currentCollateralizationRatioMantissa < thresholdCollateralizationRatioMantissa;
    }

    /**
     * @notice Checks whether the account has a vault opened for a particular yToken.
     */
    function isVaultOpen(YTokenInterface yToken, address account) external view override returns (bool) {
        return vaults[address(yToken)][account].isOpen;
    }

    /**
     * NON-CONSTANT FUNCTIONS
     */

    /**
     * @notice Transfers the collateral from the borrower's vault to the liquidator account.
     *
     * @dev Emits a {ClutchCollateral} event.
     *
     * Requirements:
     *
     * - Can only be called by the yToken.
     * - There must be enough collateral in the borrower's vault.
     *
     * @param yToken The address of the yToken contract.
     * @param liquidator The account who repaid the borrower's debt and the receiver of the collateral.
     * @param borrower The account who fell underwater and is liquidated.
     * @param collateralAmount The amount of collateral to clutch, specified in the collateral's decimal system.
     * @return true = success, otherwise it reverts.
     */
    function clutchCollateral(
        YTokenInterface yToken,
        address liquidator,
        address borrower,
        uint256 collateralAmount
    ) external override nonReentrant returns (bool) {
        /* Checks: the caller is the yToken. */
        require(msg.sender == address(yToken), "ERR_CLUTCH_COLLATERAL_NOT_AUTHORIZED");

        /* Calculate the new locked collateral amount. */
        MathError mathErr;
        uint256 newLockedCollateral;
        (mathErr, newLockedCollateral) = subUInt(vaults[address(yToken)][borrower].lockedCollateral, collateralAmount);
        require(mathErr == MathError.NO_ERROR, "ERR_CLUTCH_COLLATERAL_MATH_ERROR");

        /* Effects: update the vault. */
        vaults[address(yToken)][borrower].lockedCollateral = newLockedCollateral;

        /* Interactions: transfer the collateral. */
        yToken.collateral().safeTransfer(liquidator, collateralAmount);

        emit ClutchCollateral(yToken, liquidator, borrower, collateralAmount);

        return true;
    }

    /**
     * @notice Deposits collateral into the account's vault.
     *
     * @dev Emits a {DepositCollateral} event.
     *
     * Requirements:
     *
     * - The vault must be open.
     * - The amount to deposit cannot be zero.
     * - The Fintroller must allow this action to be performed.
     * - The caller must have allowed this contract to spend `collateralAmount` tokens.
     *
     * @param yToken The address of the yToken contract.
     * @param collateralAmount The amount of collateral to withdraw.
     * @return true = success, otherwise it reverts.
     */
    function depositCollateral(YTokenInterface yToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(yToken)
        nonReentrant
        returns (bool)
    {
        /* Checks: the zero edge case. */
        require(collateralAmount > 0, "ERR_DEPOSIT_COLLATERAL_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.getDepositCollateralAllowed(yToken), "ERR_DEPOSIT_COLLATERAL_NOT_ALLOWED");

        /* Effects: update the storage properties. */
        MathError mathErr;
        uint256 hypotheticalFreeCollateral;
        (mathErr, hypotheticalFreeCollateral) = addUInt(
            vaults[address(yToken)][msg.sender].freeCollateral,
            collateralAmount
        );
        require(mathErr == MathError.NO_ERROR, "ERR_DEPOSIT_COLLATERAL_MATH_ERROR");
        vaults[address(yToken)][msg.sender].freeCollateral = hypotheticalFreeCollateral;

        /* Interactions: perform the Erc20 transfer. */
        yToken.collateral().safeTransferFrom(msg.sender, address(this), collateralAmount);

        emit DepositCollateral(yToken, msg.sender, collateralAmount);

        return true;
    }

    struct FreeCollateralLocalVars {
        MathError mathErr;
        uint256 collateralizationRatioMantissa;
        uint256 hypotheticalCollateralizationRatioMantissa;
        uint256 newFreeCollateral;
        uint256 newLockedCollateral;
    }

    /**
     * @notice Frees a portion or all of the locked collateral.
     * @dev Emits a {FreeCollateral} event.
     *
     * Requirements:
     *
     * - The vault must be open.
     * - The amount to free cannot be zero.
     * - There must be enough locked collateral.
     * - The account cannot fall below the collateralization ratio.
     *
     * @param yToken The address of the yToken contract.
     * @param collateralAmount The amount of free collateral to lock.
     * @return bool true=success, otherwise it reverts.
     */
    function freeCollateral(YTokenInterface yToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(yToken)
        returns (bool)
    {
        FreeCollateralLocalVars memory vars;

        /* Checks: the zero edge case. */
        require(collateralAmount > 0, "ERR_FREE_COLLATERAL_ZERO");

        /* Checks: sufficient locked collateral. */
        Vault memory vault = vaults[address(yToken)][msg.sender];
        require(vault.lockedCollateral >= collateralAmount, "ERR_FREE_COLLATERAL_INSUFFICIENT_LOCKED_COLLATERAL");

        /* This operation can't fail because of the first `require` in this function. */
        (vars.mathErr, vars.newLockedCollateral) = subUInt(vault.lockedCollateral, collateralAmount);
        assert(vars.mathErr == MathError.NO_ERROR);

        /* Checks: the hypothetical collateralization ratio is above the threshold. */
        if (vault.debt > 0) {
            vars.hypotheticalCollateralizationRatioMantissa = getHypotheticalCollateralizationRatio(
                yToken,
                msg.sender,
                vars.newLockedCollateral,
                vault.debt
            );
            vars.collateralizationRatioMantissa = fintroller.getBondCollateralizationRatio(yToken);
            require(
                vars.hypotheticalCollateralizationRatioMantissa >= vars.collateralizationRatioMantissa,
                "ERR_BELOW_COLLATERALIZATION_RATIO"
            );
        }

        /* Effects: update the storage properties. */
        vaults[address(yToken)][msg.sender].lockedCollateral = vars.newLockedCollateral;
        (vars.mathErr, vars.newFreeCollateral) = addUInt(vault.freeCollateral, collateralAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");
        vaults[address(yToken)][msg.sender].freeCollateral = vars.newFreeCollateral;

        emit FreeCollateral(yToken, msg.sender, collateralAmount);

        return true;
    }

    /**
     * @notice Locks a portion or all of the free collateral to make it eligible for borrowing.
     * @dev Emits a {LockCollateral} event.
     *
     * Requirements:
     *
     * - The vault must be open.
     * - The amount to lock cannot be zero.
     * - There must be enough free collateral.
     *
     * @param yToken The address of the yToken contract.
     * @param collateralAmount The amount of free collateral to lock.
     * @return bool true=success, otherwise it reverts.
     */
    function lockCollateral(YTokenInterface yToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(yToken)
        returns (bool)
    {
        /* Avoid the zero edge case. */
        require(collateralAmount > 0, "ERR_LOCK_COLLATERAL_ZERO");

        Vault memory vault = vaults[address(yToken)][msg.sender];
        require(vault.freeCollateral >= collateralAmount, "ERR_LOCK_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL");

        MathError mathErr;
        uint256 newLockedCollateral;
        (mathErr, newLockedCollateral) = addUInt(vault.lockedCollateral, collateralAmount);
        require(mathErr == MathError.NO_ERROR, "ERR_LOCK_COLLATERAL_MATH_ERROR");
        vaults[address(yToken)][msg.sender].lockedCollateral = newLockedCollateral;

        /* This operation can't fail because of the first `require` in this function. */
        uint256 hypotheticalFreeCollateral;
        (mathErr, hypotheticalFreeCollateral) = subUInt(vault.freeCollateral, collateralAmount);
        assert(mathErr == MathError.NO_ERROR);
        vaults[address(yToken)][msg.sender].freeCollateral = hypotheticalFreeCollateral;

        emit LockCollateral(yToken, msg.sender, collateralAmount);

        return true;
    }

    /**
     * @notice Opens a Vault for the caller.
     * @dev Emits an {OpenVault} event.
     *
     * Requirements:
     *
     * - The vault cannot be already open.
     *
     * @param yToken The address of the yToken contract for which to open the vault.
     * @return true = success, otherwise it reverts.
     */
    function openVault(YTokenInterface yToken) external override returns (bool) {
        yToken.isYToken();
        require(vaults[address(yToken)][msg.sender].isOpen == false, "ERR_VAULT_OPEN");
        vaults[address(yToken)][msg.sender].isOpen = true;
        emit OpenVault(yToken, msg.sender);
        return true;
    }

    /**
     * @notice Updates the debt accrued by a particular account.
     *
     * @dev Emits a {SetVaultDebt} event.
     *
     * Requirements:
     *
     * - Can only be called by the yToken.
     *
     * @param yToken The address of the yToken contract.
     * @param account The account for which to update the debt.
     * @return bool=true success, otherwise it reverts.
     */
    function setVaultDebt(
        YTokenInterface yToken,
        address account,
        uint256 newVaultDebt
    ) external override returns (bool) {
        /* Checks: the caller is the yToken. */
        require(msg.sender == address(yToken), "ERR_SET_VAULT_DEBT_NOT_AUTHORIZED");

        /* Effects: update the storage property. */
        uint256 oldVaultDebt = vaults[address(yToken)][account].debt;
        vaults[address(yToken)][account].debt = newVaultDebt;

        emit SetVaultDebt(yToken, account, oldVaultDebt, newVaultDebt);

        return true;
    }

    /**
     * @notice Withdraws a portion or all of the free collateral.
     *
     * @dev Emits a {WithdrawCollateral} event.
     *
     * Requirements:
     *
     * - The vault must be open.
     * - The amount to withdraw cannot be zero.
     * - There must be sufficient free collateral in the vault.
     *
     * @param yToken The address of the yToken contract.
     * @param collateralAmount The amount of collateral to withdraw.
     * @return true = success, otherwise it reverts.
     */
    function withdrawCollateral(YTokenInterface yToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(yToken)
        nonReentrant
        returns (bool)
    {
        /* Checks: the zero edge case. */
        require(collateralAmount > 0, "ERR_WITHDRAW_COLLATERAL_ZERO");

        /* Checks: there is enough free collateral. */
        require(
            vaults[address(yToken)][msg.sender].freeCollateral >= collateralAmount,
            "ERR_WITHDRAW_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL"
        );

        /* Effects: update the storage properties. */
        MathError mathErr;
        uint256 newFreeCollateral;
        (mathErr, newFreeCollateral) = subUInt(vaults[address(yToken)][msg.sender].freeCollateral, collateralAmount);
        /* This operation can't fail because of the first `require` in this function. */
        assert(mathErr == MathError.NO_ERROR);
        vaults[address(yToken)][msg.sender].freeCollateral = newFreeCollateral;

        /* Interactions: perform the Erc20 transfer. */
        yToken.collateral().safeTransfer(msg.sender, collateralAmount);

        emit WithdrawCollateral(yToken, msg.sender, collateralAmount);

        return true;
    }
}
