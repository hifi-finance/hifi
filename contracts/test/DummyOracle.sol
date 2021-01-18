// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.0;

import "@hifi/protocol/contracts/oracles/UniswapAnchoredViewInterface.sol";

contract DummyOracle is UniswapAnchoredViewInterface {
    uint256 public ethPrice;
    uint256 public usdcPrice;
    uint256 public wbtcPrice;

    function price(string memory symbol) external view override returns (uint256) {
        if (areStringsEqual(symbol, "ETH")) {
            return ethPrice;
        } else if (areStringsEqual(symbol, "USDC")) {
            return usdcPrice;
        } else if (areStringsEqual(symbol, "WBTC")) {
            return wbtcPrice;
        } else {
            return 0;
        }
    }

    function setEthPrice(uint256 newEthPrice) external {
        ethPrice = newEthPrice;
    }

    function setUsdcPrice(uint256 newUsdcPrice) external {
        usdcPrice = newUsdcPrice;
    }

    function setWbtcPrice(uint256 newWbtcPrice) external {
        wbtcPrice = newWbtcPrice;
    }

    /// @dev See https://fravoll.github.io/solidity-patterns/string_equality_comparison.html
    function areStringsEqual(string memory a, string memory b) internal pure returns (bool) {
        if (bytes(a).length != bytes(b).length) {
            return false;
        } else {
            return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
        }
    }
}
