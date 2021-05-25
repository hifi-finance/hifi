/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

/// @title IAggregatorV3
/// @author Hifi
/// @dev Forked from Chainlink
/// github.com/smartcontractkit/chainlink/blob/v0.9.9/evm-contracts/src/v0.7/interfaces/IAggregatorV3.sol
interface IAggregatorV3 {
    function decimals() external view returns (uint8);

    function description() external view returns (string memory);

    function version() external view returns (uint256);

    /// getRoundData and latestRoundData should both raise "No data present" if they do not have
    /// data to report, instead of returning unset values which could be misinterpreted as
    /// actual reported values.
    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}
