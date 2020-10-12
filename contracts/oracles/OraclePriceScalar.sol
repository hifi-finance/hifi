/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./UniswapAnchoredViewInterface.sol";
import "../math/CarefulMath.sol";

library OraclePriceScalar {
    function getScaledPrice(
        UniswapAnchoredViewInterface oracle,
        string memory symbol,
        uint256 precisionScalar
    ) internal view returns (MathError, uint256) {
        uint256 price = oracle.price(symbol);
        require(price > 0, "ERR_PRICE_ZERO");

        /* Integers in Solidity can overflow. */
        uint256 scaledPrice = price * precisionScalar;
        if (scaledPrice / price != precisionScalar) {
            return (MathError.INTEGER_OVERFLOW, 0);
        } else {
            return (MathError.NO_ERROR, scaledPrice);
        }
    }
}
