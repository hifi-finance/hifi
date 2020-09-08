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
}
