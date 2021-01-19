/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

/**
 * @title ChainlinkOperatorStorage
 * @author Hifi
 */
abstract contract ChainlinkOperatorStorage {
    struct Feed {
        address asset;
        address id;
        bool isAdded;
    }

    /**
     * @dev Mapping from Erc20 symbols to Chainlink price feed aggregator contracts.
     */
    mapping(string => Feed) internal feeds;

    /**
     * @notice Chainlink price precision.
     */
    uint256 public constant pricePrecision = 8;

    /**
     * @notice The ratio between mantissa precision (1e18) and the Chainlink price precision (1e8).
     */
    uint256 public constant pricePrecisionScalar = 1.0e10;
}
