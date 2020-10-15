/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "@paulrberg/contracts/math/CarefulMath.sol";
import "./UniswapAnchoredViewInterface.sol";

library OraclePriceScalar {
    /**
     * @notice Converts the 6 decimal prices returned by the Open Price Feed to mantissa form,
     * which has 18 decimals.
     *
     * @dev Requirements:
     * - The price returned by the oracle cannot be zero.
     * - The scaled price cannot overflow.
     *
     * @param oracle The oracle contract.
     * @param symbol The Erc20 symbol of the token for which to query the price.
     * @param precisionScalar A power of 10.
     * @return The upscaled price as a mantissa.
     */
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
