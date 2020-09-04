/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

/**
 * @title ErrorReporter
 * @author Mainframe
 * @notice Utility contract for reporting standardised errors.
 * @dev Forked from Compound
 * https://github.com/compound-finance/compound-protocol/blob/v2.6/contracts/ErrorReporter.sol
 */
abstract contract ErrorReporter {
    /*** Storage Properties ***/

    /**
     * @notice Returned by functions when executed successfully.
     */
    bool public constant NO_ERROR = true;

    /*** Enums ***/

    enum Error { ERR_GUARD_REENTRANT_CALL, ERR_NO_ERROR, ERR_UNKNOWN }

    enum AdminError { ERR_NOT_AUTHORIZED, ERR_SET_ADMIN_ZERO_ADDRESS }

    enum FintrollerError {
        ERR_SET_COLLATERALIZATION_RATIO_BOND_NOT_LISTED,
        ERR_SET_COLLATERALIZATION_RATIO_OVERFLOW,
        ERR_SET_COLLATERALIZATION_RATIO_UNDERFLOW,
        ERR_SET_ORACLE_ZERO_ADDRESS
    }

    enum GuarantorPoolError {
        ERR_COLLATERAL_AUTHORIZED,
        ERR_COLLATERAL_NOT_AUTHORIZED,
        ERR_SUPPLY_MATH_ERROR,
        ERR_SUPPLY_ENDOWMENT_ERC20_TRANSFER,
        ERR_WITHDRAW_INSUFFICIENT_ENDOWMENT_BALANCET,
        ERR_WITHDRAW_ENDOWMENT_MATH_ERROR
    }

    enum YTokenError {
        ERR_BELOW_THRESHOLD_COLLATERALIZATION_RATIO,
        ERR_BOND_MATURED,
        ERR_BOND_NOT_LISTED,
        ERR_BOND_NOT_MATURED,
        ERR_BURN_NOT_ALLOWED,
        ERR_BURN_ZERO,
        ERR_REPAY_BORROW_INSUFFICIENT_BALANCE,
        ERR_REPAY_BORROW_INSUFFICIENT_DEBT,
        ERR_REPAY_BORROW_NOT_ALLOWED,
        ERR_REPAY_BORROW_ZERO,
        ERR_DEPOSIT_COLLATERAL_ERC20_TRANSFER,
        ERR_DEPOSIT_COLLATERAL_NOT_ALLOWED,
        ERR_DEPOSIT_COLLATERAL_ZERO,
        ERR_FREE_COLLATERAL_MATH_ERROR,
        ERR_FREE_COLLATERAL_INSUFFICIENT_LOCKED_COLLATERAL,
        ERR_FREE_COLLATERAL_ZERO,
        ERR_LOCK_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL,
        ERR_LOCK_COLLATERAL_MATH_ERROR,
        ERR_LOCK_COLLATERAL_ZERO,
        ERR_REDEEM_INSUFFICIENT_REDEEMABLE_UNDERLYING,
        ERR_REEDEM_MATH_ERROR,
        ERR_REDEEM_NOT_ALLOWED,
        ERR_REDEEM_ZERO,
        ERR_VAULT_NOT_OPEN,
        ERR_VAULT_OPEN,
        ERR_WITHDRAW_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL,
        ERR_WITHDRAW_COLLATERAL_ZERO
    }
}
