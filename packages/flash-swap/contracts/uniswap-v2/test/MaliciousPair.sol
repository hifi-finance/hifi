// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";

/// @title MaliciousPair
/// @author Hifi
/// @dev Strictly for testing purposes. Do not use in production.
contract MaliciousPair {
    address public collateral;
    address public underlying;

    constructor(address collateral_, address underlying_) {
        collateral = collateral_;
        underlying = underlying_;
    }

    function token0() external view returns (address) {
        return collateral;
    }

    function token1() external view returns (address) {
        return underlying;
    }

    function swap(
        uint256 amount0,
        uint256 amount1,
        IUniswapV2Callee to,
        bytes calldata data
    ) external {
        to.uniswapV2Call(msg.sender, amount0, amount1, data);
    }
}
