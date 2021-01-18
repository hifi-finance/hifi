// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.0;

import "@hifi/protocol/contracts/BalanceSheetInterface.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

import "./interfaces/UniswapV2PairLike.sol";

/// @title HifiFlashSwapStorage
/// @author Hifi
abstract contract HifiFlashSwapStorage {
    BalanceSheetInterface public balanceSheet;
    UniswapV2PairLike public pair;
    Erc20Interface public usdc;
    Erc20Interface public wbtc;
}
