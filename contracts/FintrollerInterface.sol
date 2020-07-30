/* SPDX-License-Identifier: LPGL-3.0-or-later */
pragma solidity ^0.6.10;

import "./FintrollerStorage.sol";

abstract contract FintrollerInterface is FintrollerStorage {
    event NewCollateralizationRatio(uint256 indexed newCollateralizationRatio);
}
