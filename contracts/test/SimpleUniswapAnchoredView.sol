/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "../oracles/UniswapAnchoredViewInterface.sol";

/**
 * @title SimpleUniswapAnchoredView
 * @author Mainframe
 * @dev Strictly for testing purposes. Do not use in production.
 */
contract SimpleUniswapAnchoredView is UniswapAnchoredViewInterface {
    uint256 public daiPrice;
    uint256 public wethPrice;

    constructor() {
        daiPrice = 1000000; /* $1 */
        wethPrice = 100000000; /* $100 */
    }

    function setDaiPrice(uint256 newDaiPrice) external {
        daiPrice = newDaiPrice;
    }

    function setWethPrice(uint256 newWethPrice) external {
        wethPrice = newWethPrice;
    }

    /**
     * @notice Prices are returned in the format that the Open Price Feed uses, i.e. 6 decimals of precision.
     * @dev See https://compound.finance/docs/prices#price
     */
    function price(string memory symbol) external view override returns (uint256) {
        if (areStringsEqual(symbol, "ETH")) {
            return wethPrice;
        } else if (areStringsEqual(symbol, "DAI")) {
            return daiPrice;
        } else {
            /* Everything else is worth $0 */
            return 0;
        }
    }

    function areStringsEqual(string memory a, string memory b) public pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
