/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

import "../external/chainlink/AggregatorV3Interface.sol";

/**
 * @title ChainlinkOperatorStorage
 * @author Hifi
 */
abstract contract ChainlinkOperatorStorage {
    struct Feed {
        Erc20Interface asset;
        AggregatorV3Interface id;
        bool isSet;
    }

    /**
     * @dev Mapping between Erc20 symbols and Feed structs.
     */
    mapping(string => Feed) internal feeds;

    /**
     * @notice Chainlink price precision for USD-quoted data.
     */
    uint256 public constant pricePrecision = 8;

    /**
     * @notice The ratio between mantissa precision (1e18) and the Chainlink price precision (1e8).
     */
    uint256 public constant pricePrecisionScalar = 1.0e10;
}
