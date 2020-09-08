/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./Erc20Storage.sol";

/**
 * @title Erc20Interface
 * @author Mainframe
 * @notice Interface of the Erc20 standard as defined in the ERC
 * @dev Forked from OpenZeppelin
 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/token/ERC20/IERC20.sol
 */
abstract contract Erc20Interface is Erc20Storage {
    /**
     * EVENTS
     */

    /**
     * @notice Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @notice Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /*** User Functions ***/
    function balanceOf(address account) external virtual view returns (uint256);

    function transfer(address recipient, uint256 amount) external virtual returns (bool);

    function allowance(address owner, address spender) external virtual view returns (uint256);

    function approve(address spender, uint256 amount) external virtual returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external virtual returns (bool);
}
