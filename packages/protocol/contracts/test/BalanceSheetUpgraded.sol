// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../access/OwnableUpgradeable.sol";
import "../core/balance-sheet/SBalanceSheetV2.sol";

/// @title IBalanceSheetUpgraded
/// @author Hifi
interface IBalanceSheetUpgraded {
    function getLastBlockNumber() external view returns (uint256);

    function setLastBlockNumber() external;
}

/// @title SBalanceSheetUpgraded
/// @author Hifi
abstract contract SBalanceSheetUpgraded is SBalanceSheetV2 {
    uint256 public lastBlockNumber;
}

/// @title BalanceSheetUpgraded
/// @author Hifi
contract BalanceSheetUpgraded is Initializable, OwnableUpgradeable, IBalanceSheetUpgraded, SBalanceSheetUpgraded {
    function getLastBlockNumber() external view override returns (uint256) {
        return lastBlockNumber;
    }

    function setLastBlockNumber() external override {
        lastBlockNumber = block.number;
    }
}
