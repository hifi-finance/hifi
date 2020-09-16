/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "@nomiclabs/buidler/console.sol";
import "./BalanceSheetInterface.sol";
import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";
import "./erc20/Erc20Interface.sol";
import "./erc20/SafeErc20.sol";
import "./math/Exponential.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title BalanceSheet
 * @author Mainframe
 */
contract BalanceSheet is BalanceSheetInterface, Admin, ErrorReporter, Exponential, ReentrancyGuard {
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

    /**
     * @notice Returns the vault data.
     */
    function getVault(YTokenInterface yToken, address user)
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
        debt = vaults[address(yToken)][user].debt;
        freeCollateral = vaults[address(yToken)][user].freeCollateral;
        lockedCollateral = vaults[address(yToken)][user].lockedCollateral;
        isOpen = vaults[address(yToken)][user].isOpen;
    }

    /**
     * @notice Checks whether a user has a vault opened for a particular yToken.
     */
    function isVaultOpen(YTokenInterface yToken, address user) external override view returns (bool) {
        return vaults[address(yToken)][user].isOpen;
    }

    /**
     * NON-CONSTANT FUNCTIONS
     */

    struct DepositLocalVars {
        MathError mathErr;
        uint256 hypotheticalFreeCollateral;
    }

    /**
     * @notice Deposits collateral into the user's vault.
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
        DepositLocalVars memory vars;

        /* Checks: the zero edge case. */
        require(collateralAmount > 0, "ERR_DEPOSIT_COLLATERAL_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.depositCollateralAllowed(yToken), "ERR_DEPOSIT_COLLATERAL_NOT_ALLOWED");

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
        uint256 collateralPriceFromOracle;
        uint256 collateralPriceUpscaled;
        uint256 collateralizationRatioMantissa;
        Exp debtValue;
        Exp hypotheticalCollateralizationRatio;
        uint256 hypotheticalFreeCollateral;
        uint256 hypotheticalLockedCollateral;
        uint256 hypotheticalLockedCollateralUpscaled;
        Exp hypotheticalLockedCollateralValue;
        uint256 underlyingPriceFromOracle;
        uint256 underlyingPriceUpscaled;
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
     * - The user cannot fall below the collateralization ratio.
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
        (vars.mathErr, vars.hypotheticalLockedCollateral) = subUInt(vault.lockedCollateral, collateralAmount);
        assert(vars.mathErr == MathError.NO_ERROR);

        (vars.mathErr, vars.hypotheticalLockedCollateralUpscaled) = mulUInt(
            vars.hypotheticalLockedCollateral,
            yToken.collateralPrecisionScalar()
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

        /* Checks: the hypothetical collateralization ratio is above the threshold. */
        if (vault.debt > 0) {
            UniswapAnchoredViewInterface oracle = fintroller.oracle();
            vars.collateralPriceFromOracle = oracle.price(yToken.collateral().symbol());
            require(vars.collateralPriceFromOracle > 0, "ERR_COLLATERAL_PRICE_ZERO");

            (vars.mathErr, vars.collateralPriceUpscaled) = mulUInt(vars.collateralPriceFromOracle, 1e12);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

            (vars.mathErr, vars.hypotheticalLockedCollateralValue) = mulExp(
                Exp({ mantissa: vars.hypotheticalLockedCollateralUpscaled }),
                Exp({ mantissa: vars.collateralPriceUpscaled })
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

            vars.underlyingPriceFromOracle = oracle.price(yToken.underlying().symbol());
            require(vars.underlyingPriceFromOracle > 0, "ERR_UNDERLYING_PRICE_ZERO");

            (vars.mathErr, vars.underlyingPriceUpscaled) = mulUInt(vars.underlyingPriceFromOracle, 1e12);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

            (vars.mathErr, vars.debtValue) = mulExp(
                Exp({ mantissa: vault.debt }),
                Exp({ mantissa: vars.underlyingPriceUpscaled })
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

            /* This operation can't fail because both operands are non-zero. */
            (vars.mathErr, vars.hypotheticalCollateralizationRatio) = divExp(
                vars.hypotheticalLockedCollateralValue,
                vars.debtValue
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

            (vars.collateralizationRatioMantissa) = fintroller.getBond(yToken);
            require(
                vars.hypotheticalCollateralizationRatio.mantissa >= vars.collateralizationRatioMantissa,
                "ERR_BELOW_THRESHOLD_COLLATERALIZATION_RATIO"
            );
        }

        /* Effects: update the storage properties. */
        vaults[address(yToken)][msg.sender].lockedCollateral = vars.hypotheticalLockedCollateral;
        (vars.mathErr, vars.hypotheticalFreeCollateral) = addUInt(vault.freeCollateral, collateralAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");
        vaults[address(yToken)][msg.sender].freeCollateral = vars.hypotheticalFreeCollateral;

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
     * @notice Updates the debt accrued by a particular user.
     *
     * @dev Emits a {SetVaultDebt} event.
     *
     * Requirements:
     *
     * - The vault must be open.
     * - Can only be called by the yToken contract.
     *
     * @param yToken The address of the yToken contract.
     * @param user The account for whom to update the debt.
     * @return bool=true success, otherwise it reverts.
     */
    function setVaultDebt(
        YTokenInterface yToken,
        address user,
        uint256 newVaultDebt
    ) external override isVaultOpenForMsgSender(yToken) returns (bool) {
        SetDebtLocalVars memory vars;

        /* Checks: the caller is the yToken contract. */
        require(msg.sender == address(yToken), "ERR_SET_DEBT_NOT_AUTHORIZED");

        /* Effects: update the storage property. */
        vars.oldVaultDebt = vaults[address(yToken)][user].debt;
        vaults[address(yToken)][user].debt = newVaultDebt;

        emit SetVaultDebt(yToken, user, vars.oldVaultDebt, newVaultDebt);

        return NO_ERROR;
    }

    struct WithdrawCollateralLocalVars {
        MathError mathErr;
        uint256 hypotheticalFreeCollateral;
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
        (vars.mathErr, vars.hypotheticalFreeCollateral) = subUInt(
            vaults[address(yToken)][msg.sender].freeCollateral,
            collateralAmount
        );
        /* This operation can't fail because of the first `require` in this function. */
        assert(vars.mathErr == MathError.NO_ERROR);
        vaults[address(yToken)][msg.sender].freeCollateral = vars.hypotheticalFreeCollateral;

        /* Interactions: perform the Erc20 transfer. */
        yToken.collateral().safeTransfer(msg.sender, collateralAmount);

        emit WithdrawCollateral(yToken, msg.sender, collateralAmount);

        return NO_ERROR;
    }
}
