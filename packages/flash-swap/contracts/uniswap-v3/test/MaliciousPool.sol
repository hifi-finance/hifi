// SPDX-License-Identifier: UNLICENSED
// solhint-disable no-unused-vars
pragma solidity ^0.8.4;

import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3FlashCallback.sol";

/// @title MaliciousPool
/// @author Hifi
/// @dev Strictly for testing purposes. Do not use in production.
contract MaliciousPool {
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

    function flash(
        address recipient,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external {
        IUniswapV3FlashCallback(msg.sender).uniswapV3FlashCallback(0, 0, data);
    }
}
