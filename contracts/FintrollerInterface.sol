/* SPDX-License-Identifier: LPGL-3.0-or-later */
pragma solidity ^0.6.10;

import "./FintrollerStorage.sol";
import "./YTokenInterface.sol";

abstract contract FintrollerInterface is FintrollerStorage {
    function listBond(YTokenInterface bond) external virtual returns (bool);

    event ListBond(YTokenInterface bond);
    event NewCollateralizationRatio(address bond, uint256 oldCollateralizationRatio, uint256 newCollateralizationRatio);
    event NewOracle(address oldOracle, address newOracle);
}
