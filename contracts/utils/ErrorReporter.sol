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

    enum Error { ERR_GUARD_REENTRANT_CALL, ERR_NO_ERROR }

    enum AdminError { ERR_NOT_AUTHORIZED, ERR_SET_ADMIN_ZERO_ADDRESS }

    enum FintrollerError {
        ERR_SET_COLLATERALIZATION_RATIO_BOND_NOT_LISTED,
        ERR_SET_COLLATERALIZATION_RATIO_OVERFLOW,
        ERR_SET_COLLATERALIZATION_RATIO_UNDERFLOW
    }

    enum GuarantorPoolError {
        ERR_COLLATERAL_AUTHORIZED,
        ERR_COLLATERAL_NOT_AUTHORIZED,
        ERR_DEPOSIT_ENDOWMENT_MATH_ERROR,
        ERR_SUPPLY_ENDOWMENT_ERC20_TRANSFER,
        ERR_WITHDRAW_ENDOWMENT_BALANCE_INSUFFICIENT,
        ERR_WITHDRAW_ENDOWMENT_MATH_ERROR
    }

    enum YTokenError {
        ERR_COLLATERALIZATION_INSUFFICIENT,
        ERR_NOT_MATURED,
        ERR_SUPPLY_ERC20_TRANSFER,
        ERR_VAULT_NOT_OPEN,
        ERR_VAULT_OPEN
    }
}
