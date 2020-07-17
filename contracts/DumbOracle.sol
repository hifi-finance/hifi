/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

/**
 * @title DumbOracle
 * @author Mainframe
 * @dev Strictly for testing purposes. Do not use in production.
 */
contract DumbOracle {
    function getEthPriceInUsd() public pure returns (uint256) {
        return 100;
    }

    function getDaiPriceInUsd() public pure returns (uint256) {
        return 1;
    }

    function getEthPriceInDai() external pure returns (uint256) {
        uint256 ethPriceInUsd = getEthPriceInUsd();
        uint256 daiPriceInUsd = getDaiPriceInUsd();
        return ethPriceInUsd / daiPriceInUsd;
    }
}
