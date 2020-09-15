/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "../oracles/UniswapAnchoredViewInterface.sol";

/**
 * @title SimpleUniswapAnchoredView
 * @author Mainframe
 * @dev Strictly for testing purposes. Do not use in production.
 */
contract SimpleUniswapAnchoredView is UniswapAnchoredViewInterface {
    /**
     * @dev Prices are returned in the format that the Open Price Feed uses: 6 decimals of precision.
     * https://compound.finance/docs/prices#price
     */
    function price(string memory symbol) external override pure returns (uint256) {
        /* 1 ETH = $200 */
        if (areStringsEqual(symbol, "WETH")) {
            return 100000000;
        }
        /* 1 DAI = $1 */
        else if (areStringsEqual(symbol, "DAI")) {
            return 1000000;
        }
        /* Anything else = $0 */
        else {
            return 0;
        }
    }

    function areStringsEqual(string memory a, string memory b) public pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
