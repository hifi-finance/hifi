// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../access/OwnableUpgradeable.sol";
import "../core/balance-sheet/SBalanceSheetV2.sol";

/// @title IBalanceSheetV3
/// @author Hifi
interface IBalanceSheetV3 {
    function getLastBlockNumber() external view returns (uint256);

    function setLastBlockNumber() external;
}

/// @title SBalanceSheetV2
/// @author Hifi
abstract contract SBalanceSheetV3 is SBalanceSheetV2 {
    uint256 public lastBlockNumber;
}

/// @title BalanceSheetV3
/// @author Hifi
contract BalanceSheetV3 is Initializable, OwnableUpgradeable, IBalanceSheetV3, SBalanceSheetV3 {
    function getLastBlockNumber() external view override returns (uint256) {
        return lastBlockNumber;
    }

    function setLastBlockNumber() external override {
        lastBlockNumber = block.number;
    }
}
