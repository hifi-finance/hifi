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

    enum GuarantorPoolError {
        ERR_COLLATERAL_AUTHORIZED,
        ERR_COLLATERAL_NOT_AUTHORIZED,
        ERR_DEPOSIT_ENDOWMENT_MATH_ERR,
        ERR_DEPOSIT_ENDOWMENT_TRANSFER_FROM,
        ERR_WITHDRAW_ENDOWMENT_INSUFFICIENT_BALANCE,
        ERR_WITHDRAW_ENDOWMENT_MATH_ERR
    }

    enum yTokenError { ERR_NOT_MATURED }
}
