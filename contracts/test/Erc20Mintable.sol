/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "../erc20/Erc20.sol";

/**
 * @title Erc20Mintable
 * @author Mainframe
 * @notice Anybody can mint.
 * @dev Strictly for test purposes. Do not use in production.
 */
contract Erc20Mintable is Erc20 {
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) public Erc20(name, symbol, decimals) {} /* solhint-disable-line no-empty-blocks */

    /**
     * @notice Function to mint tokens.
     * @param to The address that will receive the minted tokens.
     * @param value The amount of tokens to mint.
     * @return bool true=success, otherwise it reverts.
     */
    function mint(address to, uint256 value) public returns (bool) {
        mintInternal(to, value);
        return true;
    }

    /** @notice Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * @dev Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements
     *
     * - `account` cannot be the zero address.
     */
    function mintInternal(address account, uint256 amount) internal virtual {
        require(account != address(0x00), "ERR_MINT_ZERO_ADDRESS");

        totalSupply = totalSupply.add(amount);
        balances[account] = balances[account].add(amount);
        emit Transfer(address(0x00), account, amount);
    }
}
