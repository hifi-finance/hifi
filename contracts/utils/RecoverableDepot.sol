/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./RecoverableDepotInterface.sol";
import "../erc20/Erc20Interface.sol";
import "../erc20/SafeErc20.sol";
import "../utils/Admin.sol";

/**
 * @title RecoverableDepot
 * @author Mainframe
 * @notice Gives the administrator the ability to recover the Erc20 tokens sent (accidentally, or not)
 * to the contract.
 */
abstract contract RecoverableDepot is
    RecoverableDepotInterface, /* one dependency */
    Admin /* two dependencies */
{
    using SafeErc20 for Erc20Interface;

    /**
     * @notice Sets the tokens that this contract cannot recover.
     *
     * @dev Emits a {SetNonRecoverableTokens} event.
     *
     * Requirements:
     * - The caller must be the administrator.
     * - The contract must be non-initialized.
     * - The array of given tokens cannot be empty.
     *
     * @param tokens The array of tokens to set as non-recoverable.
     */
    function setNonRecoverableTokens(Erc20Interface[] calldata tokens) external override onlyAdmin {
        /* Checks */
        require(initialized == false, "ERR_SET_NON_RECOVERABLE_TOKENS_INITIALIZED");
        require(tokens.length > 0, "ERR_SET_NON_RECOVERABLE_TOKENS_EMPTY_ARRAY");

        /* Iterate over the token list, sanity check each and update the mapping. */
        uint256 length = tokens.length;
        for (uint256 i = 0; i < length; i += 1) {
            tokens[i].symbol();
            nonRecoverableTokens.push(tokens[i]);
        }

        /* Prevents this function from ever being called again. */
        initialized = true;
    }

    /**
     * @notice Recover Erc20 tokens sent to this contract (by accident or otherwise).
     * @dev Emits a {RecoverToken} event.
     *
     * Requirements:
     * - The caller must be the administrator.
     * - The contract must be initialized.
     * - The amount to recover cannot be zero.
     * - The token to recover cannot be among the non-recoverable tokens.
     *
     * @param token The token to make the recover for.
     * @param recoverAmount The amount to recover, measured in the token's decimal system.
     */
    function recoverErc20(Erc20Interface token, uint256 recoverAmount) external override onlyAdmin {
        /* Checks */
        require(initialized == true, "ERR_RECOVER_ERC20_NOT_INITALIZED");
        require(recoverAmount > 0, "ERR_RECOVER_ERC20_ZERO");

        bytes32 tokenSymbolHash = keccak256(bytes(token.symbol()));
        uint256 length = nonRecoverableTokens.length;

        /**
         * We iterate over the non-recoverable token array and check that:
         *
         *   1. The addresses of the tokens are not the same
         *   2. The symbols of the tokens are not the same
         *
         * It is true that the second check may lead to a false positive, but
         * there is no better way to fend off against proxied tokens.
         */
        for (uint256 i = 0; i < length; i += 1) {
            require(
                address(token) != address(nonRecoverableTokens[i]) &&
                    tokenSymbolHash != keccak256(bytes(nonRecoverableTokens[i].symbol())),
                "ERR_RECOVER_ERC20_NON_RECOVERABLE_TOKEN"
            );
        }

        /* Interactions */
        token.safeTransfer(admin, recoverAmount);

        emit RecoverToken(admin, token, recoverAmount);
    }
}
