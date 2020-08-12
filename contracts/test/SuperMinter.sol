/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "../erc20/Erc20Interface.sol";
import "../math/SafeMath.sol";

/**
 * @title SuperMinter
 * @author Mainframe
 * @dev Strictly for testing purposes. Do not use in production.
 */
contract SuperMinter {
    using SafeMath for uint256;

    /**
     * @dev Expected to be called from the testing environment.
     *
     * Requirements:
     * - the contract has to own at least `amount * accounts.length` tokens prior to the call
     * - the distribution amount must be more than 0
     * - at least one account must be provided
     */
    function distributeTokensToAccounts(
        address token,
        uint256 amount,
        address[] calldata accounts
    ) external {
        require(amount > 0, "ERR_AMOUNT_ZERO");
        require(accounts.length > 0, "ERR_NO_ACCOUNTS");

        Erc20Interface(token).totalSupply();
        require(
            Erc20Interface(token).balanceOf(address(this)) >= amount.mul(accounts.length),
            "ERR_ERC20_INSUFFICIENT_BALANCE"
        );

        uint256 length = accounts.length;
        for (uint256 i = 0; i < length; i += 1) {
            require(Erc20Interface(token).transfer(accounts[i], amount), "ERR_ERC20_TRANSFER");
        }
    }
}
