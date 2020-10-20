/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "@paulrberg/contracts/math/CarefulMath.sol";
import "../oracles/OraclePriceScalar.sol";
import "../oracles/UniswapAnchoredViewInterface.sol";

/**
 * @title TestOraclePriceScalar
 * @author Mainframe
 * @dev Strictly for test purposes. Do not use in production.
 */
contract TestOraclePriceScalar {
    using OraclePriceScalar for UniswapAnchoredViewInterface;

    UniswapAnchoredViewInterface public oracle;

    constructor(UniswapAnchoredViewInterface oracle_) {
        oracle = oracle_;
    }

    function testGetScaledPrice(string memory symbol, uint256 precisionScalar) external view returns (uint256) {
        MathError mathErr;
        uint256 scaledPrice;
        (mathErr, scaledPrice) = oracle.getScaledPrice(symbol, precisionScalar);
        require(mathErr == MathError.NO_ERROR, "ERR_TEST_GET_SCALED_PRICE_MATH_ERROR");
        return scaledPrice;
    }
}
