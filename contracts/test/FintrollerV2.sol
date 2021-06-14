// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../access/OwnableUpgradeable.sol";
import "../core/fintroller/SFintrollerV1.sol";

/// @title IFintrollerV2
/// @author Hifi
interface IFintrollerV2 {
    function getLastBlockNumber() external view returns (uint256);

    function setLastBlockNumber() external;
}

/// @title SFintrollerV2
/// @author Hifi
abstract contract SFintrollerV2 is SFintrollerV1 {
    uint256 public lastBlockNumber;
}

/// @title FintrollerV2
/// @author Hifi
contract FintrollerV2 is Initializable, OwnableUpgradeable, IFintrollerV2, SFintrollerV2 {
    function getLastBlockNumber() external view override returns (uint256) {
        return lastBlockNumber;
    }

    function setLastBlockNumber() external override {
        lastBlockNumber = block.number;
    }
}
