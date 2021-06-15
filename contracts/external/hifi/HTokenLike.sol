// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

/// @title HTokenLike
/// @author Hifi
interface HTokenLike {
    function balanceOf(address account) external view returns (uint256);

    function expirationTime() external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}
