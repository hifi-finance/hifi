// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../access/OwnableUpgradeable.sol";
import "../core/balanceSheet/SBalanceSheetV1.sol";

/// @title IBalanceSheetV2
/// @author Hifi
interface IBalanceSheetV2 {
    function getLastBlockNumber() external view returns (uint256);

    function setLastBlockNumber() external;
}

/// @title SBalanceSheetV2
/// @author Hifi
abstract contract SBalanceSheetV2 is SBalanceSheetV1 {
    uint256 public lastBlockNumber;
}

/// @title BalanceSheetV2
/// @author Hifi
contract BalanceSheetV2 is Initializable, OwnableUpgradeable, IBalanceSheetV2, SBalanceSheetV2 {
    function getLastBlockNumber() external view override returns (uint256) {
        return lastBlockNumber;
    }

    function setLastBlockNumber() external override {
        lastBlockNumber = block.number;
    }
}
