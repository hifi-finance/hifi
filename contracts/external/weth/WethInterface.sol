/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.8.0;

import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

/**
 * @title WethInterface
 * @author Hifi
 */
interface WethInterface {
    function deposit() external payable;

    function withdraw(uint256) external;
}
