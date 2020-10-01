/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./BalanceSheetInterface.sol";
import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";
import "./erc20/Erc20Interface.sol";
import "./erc20/SafeErc20.sol";
import "./oracles/UniswapAnchoredViewInterface.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title BalanceSheet
 * @author Mainframe
 */
contract BalanceSheet is BalanceSheetInterface, Admin, ErrorReporter, ReentrancyGuard {
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

    struct GetHypotheticalAccountLiquidityLocalVars {
        MathError mathErr;
        uint256 collateralPriceFromOracle;
        uint256 collateralPriceUpscaled;
        uint256 collateralizationRatioMantissa;
        Exp debtValueUsd;
        Exp hypotheticalCollateralizationRatio;
        Exp hypotheticalLockedCollateralValueUsd;
        uint256 hypotheticalLockedCollateralUpscaled;
        uint256 underlyingPriceFromOracle;
        uint256 underlyingPriceUpscaled;
    }

    /**
     * @notice Determines the current collateralization ratio for the given account;
     * @param yToken The yToken to make the query against.
     * @param account The account to make the query against.
     * @return A quotient if locked collateral is non-zero, otherwise zero.
     */
    function getCurrentCollateralizationRatio(YTokenInterface yToken, address account)
        external
        override
        view
        returns (uint256)
    {
        Vault memory vault = vaults[address(yToken)][account];
        return getHypotheticalCollateralizationRatio(yToken, account, vault.lockedCollateral, vault.debt);
    }

    /**
     * @notice Determines the account collateralization ratio for the given locked collateral amount and debt.
     *
     * @dev Requirements:
     *
     * - The vault must be open.
     * - `debt` must be non-zero.
     * - The oracle prices must be non-zero.
     * - There must be no math error.
     *
     * @param yToken The yToken for which to make the query against.
     * @param account The account for whom to make the query against.
     * @param lockedCollateralAmount The hypothetical locked collateral.
     * @param debt The hypothetical debt.
     * @return A quotient if locked collateral is non-zero, otherwise zero.
     */
    function getHypotheticalCollateralizationRatio(
        YTokenInterface yToken,
        address account,
        uint256 lockedCollateralAmount,
        uint256 debt
    ) public override view returns (uint256) {
        GetHypotheticalAccountLiquidityLocalVars memory vars;

        /* If the vault is not open, a hypothetical collateralization ratio cannot be calculated. */
        require(vaults[address(yToken)][account].isOpen, "ERR_VAULT_NOT_OPEN");

        /* Avoid the zero edge cases. */
        if (lockedCollateralAmount == 0) {
            return 0;
        }
        require(debt > 0, "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_DEBT_ZERO");

        /* Grab the USD price of the collateral from the oracle. */
        UniswapAnchoredViewInterface oracle = fintroller.oracle();
        vars.collateralPriceFromOracle = oracle.price(yToken.collateral().symbol());
        require(vars.collateralPriceFromOracle > 0, "ERR_COLLATERAL_PRICE_ZERO");

        /* Upscale the 6 decimal oracle price to mantissa precision. */
        (vars.mathErr, vars.collateralPriceUpscaled) = mulUInt(
            vars.collateralPriceFromOracle,
            fintroller.oraclePricePrecisionScalar()
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_MATH_ERROR");

        /* Grab the USD price of the underlying from the oracle. */
        vars.underlyingPriceFromOracle = oracle.price(yToken.underlying().symbol());
        require(vars.underlyingPriceFromOracle > 0, "ERR_UNDERLYING_PRICE_ZERO");

        /* Upscale the 6 decimal oracle price to mantissa precision. */
        (vars.mathErr, vars.underlyingPriceUpscaled) = mulUInt(
            vars.underlyingPriceFromOracle,
            fintroller.oraclePricePrecisionScalar()
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_MATH_ERROR");

        /* Upscale the collateral, which can have any precision, to mantissa precision. */
        (vars.mathErr, vars.hypotheticalLockedCollateralUpscaled) = mulUInt(
            lockedCollateralAmount,
            yToken.collateralPrecisionScalar()
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_MATH_ERROR");

        /* Calculate the USD value of the collateral. */
        (vars.mathErr, vars.hypotheticalLockedCollateralValueUsd) = mulExp(
            Exp({ mantissa: vars.hypotheticalLockedCollateralUpscaled }),
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
            vars.hypotheticalLockedCollateralValueUsd,
            vars.debtValueUsd
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_MATH_ERROR");

        return vars.hypotheticalCollateralizationRatio.mantissa;
    }

    /**
     * @notice Reads all the storage properties of a vault.
     */
    function getVault(YTokenInterface yToken, address account)
        external
        override
        view
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
     * @notice Checks whether the account has a vault opened for a particular yToken.
     */
    function isVaultOpen(YTokenInterface yToken, address account) external override view returns (bool) {
        return vaults[address(yToken)][account].isOpen;
    }

    /**
     * NON-CONSTANT FUNCTIONS
     */

    struct DepositCollateralLocalVars {
        MathError mathErr;
        uint256 hypotheticalFreeCollateral;
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
     * @return bool=success, otherwise it reverts.
     */
    function depositCollateral(YTokenInterface yToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(yToken)
        nonReentrant
        returns (bool)
    {
        DepositCollateralLocalVars memory vars;

        /* Checks: the zero edge case. */
        require(collateralAmount > 0, "ERR_DEPOSIT_COLLATERAL_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.getDepositCollateralAllowed(yToken), "ERR_DEPOSIT_COLLATERAL_NOT_ALLOWED");

        /* Effects: update the storage properties. */
        (vars.mathErr, vars.hypotheticalFreeCollateral) = addUInt(
            vaults[address(yToken)][msg.sender].freeCollateral,
            collateralAmount
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_DEPOSIT_COLLATERAL_MATH_ERROR");
        vaults[address(yToken)][msg.sender].freeCollateral = vars.hypotheticalFreeCollateral;

        /* Interactions: perform the Erc20 transfer. */
        yToken.collateral().safeTransferFrom(msg.sender, address(this), collateralAmount);

        emit DepositCollateral(yToken, msg.sender, collateralAmount);

        return NO_ERROR;
    }

    struct FreeCollateralLocalVars {
        MathError mathErr;
        uint256 hypotheticalCollateralizationRatioMantissa;
        uint256 newFreeCollateral;
        uint256 newLockedCollateral;
        uint256 thresholdCollateralizationRatioMantissa;
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
            vars.thresholdCollateralizationRatioMantissa = fintroller.getBondThresholdCollateralizationRatio(yToken);
            require(
                vars.hypotheticalCollateralizationRatioMantissa >= vars.thresholdCollateralizationRatioMantissa,
                "ERR_BELOW_THRESHOLD_COLLATERALIZATION_RATIO"
            );
        }

        /* Effects: update the storage properties. */
        vaults[address(yToken)][msg.sender].lockedCollateral = vars.newLockedCollateral;
        (vars.mathErr, vars.newFreeCollateral) = addUInt(vault.freeCollateral, collateralAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");
        vaults[address(yToken)][msg.sender].freeCollateral = vars.newFreeCollateral;

        emit FreeCollateral(yToken, msg.sender, collateralAmount);

        return NO_ERROR;
    }

    struct LockCollateralLocalVars {
        MathError mathErr;
        uint256 hypotheticalFreeCollateral;
        uint256 newLockedCollateral;
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
        LockCollateralLocalVars memory vars;

        /* Avoid the zero edge case. */
        require(collateralAmount > 0, "ERR_LOCK_COLLATERAL_ZERO");

        Vault memory vault = vaults[address(yToken)][msg.sender];
        require(vault.freeCollateral >= collateralAmount, "ERR_LOCK_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL");

        (vars.mathErr, vars.newLockedCollateral) = addUInt(vault.lockedCollateral, collateralAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_LOCK_COLLATERAL_MATH_ERROR");
        vaults[address(yToken)][msg.sender].lockedCollateral = vars.newLockedCollateral;

        /* This operation can't fail because of the first `require` in this function. */
        (vars.mathErr, vars.hypotheticalFreeCollateral) = subUInt(vault.freeCollateral, collateralAmount);
        assert(vars.mathErr == MathError.NO_ERROR);
        vaults[address(yToken)][msg.sender].freeCollateral = vars.hypotheticalFreeCollateral;

        emit LockCollateral(yToken, msg.sender, collateralAmount);

        return NO_ERROR;
    }

    /**
     * @notice Opens a Vault for the caller.
     * @dev Emits an {OpenVault} event.
     *
     * Requirements:
     *
     * - The vault must not be open.
     *
     * @param yToken The address of the yToken contract for which to open the vault.
     * @return bool=success, otherwise it reverts.
     */
    function openVault(YTokenInterface yToken) external override returns (bool) {
        yToken.isYToken();
        require(vaults[address(yToken)][msg.sender].isOpen == false, "ERR_VAULT_OPEN");
        vaults[address(yToken)][msg.sender].isOpen = true;
        emit OpenVault(yToken, msg.sender);
        return NO_ERROR;
    }

    struct SetDebtLocalVars {
        uint256 oldVaultDebt;
    }

    /**
     * @notice Updates the debt accrued by a particular account.
     *
     * @dev Emits a {SetVaultDebt} event.
     *
     * Requirements:
     *
     * - The vault must be open.
     * - Can only be called by the yToken contract.
     *
     * @param yToken The address of the yToken contract.
     * @param account The account for whom to update the debt.
     * @return bool=true success, otherwise it reverts.
     */
    function setVaultDebt(
        YTokenInterface yToken,
        address account,
        uint256 newVaultDebt
    ) external override isVaultOpenForMsgSender(yToken) returns (bool) {
        SetDebtLocalVars memory vars;

        /* Checks: the caller is the yToken contract. */
        require(msg.sender == address(yToken), "ERR_SET_DEBT_NOT_AUTHORIZED");

        /* Effects: update the storage property. */
        vars.oldVaultDebt = vaults[address(yToken)][account].debt;
        vaults[address(yToken)][account].debt = newVaultDebt;

        emit SetVaultDebt(yToken, account, vars.oldVaultDebt, newVaultDebt);

        return NO_ERROR;
    }

    struct WithdrawCollateralLocalVars {
        MathError mathErr;
        uint256 newFreeCollateral;
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
     * @return bool=success, otherwise it reverts.
     */
    function withdrawCollateral(YTokenInterface yToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(yToken)
        nonReentrant
        returns (bool)
    {
        WithdrawCollateralLocalVars memory vars;

        /* Checks: the zero edge case. */
        require(collateralAmount > 0, "ERR_WITHDRAW_COLLATERAL_ZERO");

        /* Checks: there is enough free collateral. */
        require(
            vaults[address(yToken)][msg.sender].freeCollateral >= collateralAmount,
            "ERR_WITHDRAW_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL"
        );

        /* Effects: update the storage properties. */
        (vars.mathErr, vars.newFreeCollateral) = subUInt(
            vaults[address(yToken)][msg.sender].freeCollateral,
            collateralAmount
        );
        /* This operation can't fail because of the first `require` in this function. */
        assert(vars.mathErr == MathError.NO_ERROR);
        vaults[address(yToken)][msg.sender].freeCollateral = vars.newFreeCollateral;

        /* Interactions: perform the Erc20 transfer. */
        yToken.collateral().safeTransfer(msg.sender, collateralAmount);

        emit WithdrawCollateral(yToken, msg.sender, collateralAmount);

        return NO_ERROR;
    }
}
