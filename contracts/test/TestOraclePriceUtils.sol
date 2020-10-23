/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "@paulrberg/contracts/math/CarefulMath.sol";
import "../oracles/OraclePriceUtils.sol";
import "../oracles/UniswapAnchoredViewInterface.sol";

/**
 * @title TestOraclePriceUtils
 * @author Mainframe
 * @dev Strictly for test purposes. Do not use in production.
 */
contract TestOraclePriceUtils {
    using OraclePriceUtils for UniswapAnchoredViewInterface;

    UniswapAnchoredViewInterface public oracle;

    constructor(UniswapAnchoredViewInterface oracle_) {
        oracle = oracle_;
    }

    function testGetAdjustedPrice(string memory symbol, uint256 precisionScalar) external view returns (uint256) {
        MathError mathErr;
        uint256 adjustedPrice;
        (mathErr, adjustedPrice) = oracle.getAdjustedPrice(symbol, precisionScalar);
        require(mathErr == MathError.NO_ERROR, "ERR_TEST_GET_ADJUSTED_PRICE_MATH_ERROR");
        return adjustedPrice;
    }
}
