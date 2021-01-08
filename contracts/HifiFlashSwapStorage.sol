// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.0;

import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

import "./interfaces/BalanceSheetLike.sol";
import "./interfaces/FintrollerLike.sol";
import "./interfaces/UniswapV2PairLike.sol";

/// @title HifiFlashSwapStorage
/// @author Hifi
abstract contract HifiFlashSwapStorage {
    BalanceSheetLike public balanceSheet;
    FintrollerLike public fintroller;
    UniswapV2PairLike public pair;
    Erc20Interface public token0;
    Erc20Interface public token1;
}
