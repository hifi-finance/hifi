/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.8.0;

import "./BatterseaTargetV1Storage.sol";

/**
 * @title BatterseaTargetV1Interface
 * @author Hifi
 * @notice Storage contract for BatterseaTargetV1.
 */
abstract contract BatterseaTargetV1Interface is BatterseaTargetV1Storage {
    event BorrowAndSellFyTokens(
        address indexed borrower,
        uint256 borrowAmount,
        uint256 fyTokenDelta,
        uint256 underlyingAmount
    );
}
