/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "./BatterseaScriptsV1Storage.sol";

/**
 * @title BatterseaScriptsV1Interface
 * @author Mainframe
 * @notice Storage contract for BatterseaScriptsV1.
 */
abstract contract BatterseaScriptsV1Interface is BatterseaScriptsV1Storage {
    event BorrowAndSellFyTokens(
        address indexed borrower,
        uint256 borrowAmount,
        uint256 fyTokenDelta,
        uint256 underlyingAmount
    );
}
