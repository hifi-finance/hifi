/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./SimpleOracleInterface.sol";

/**
 * @title SimpleOracle
 * @author Mainframe
 * @dev Strictly for testing purposes. Do not use in production.
 */
contract SimpleOracle is SimpleOracleInterface {
    /**
     * @dev TODO: use Exp
     */
    function getCollateralPriceInUsd() public override view returns (uint256) {
        return 200;
    }

    /**
     * @dev TODO: use Exp
     */
    function getUnderlyingPriceInUsd() public override view returns (uint256) {
        return 1;
    }

    struct MultiplyCollateralAmountLocalVars {
        MathError mathErr;
        uint256 collateralPriceInUsd;
        uint256 collateralValueInUsd;
    }

    function multiplyCollateralAmountByItsPriceInUsd(uint256 collateralAmount)
        external
        override
        view
        returns (MathError, uint256)
    {
        MultiplyCollateralAmountLocalVars memory vars;
        vars.collateralPriceInUsd = getCollateralPriceInUsd();
        (vars.mathErr, vars.collateralValueInUsd) = mulUInt(collateralAmount, vars.collateralPriceInUsd);
        return (vars.mathErr, vars.collateralValueInUsd);
    }

    struct MultiplyUnderlyingAmountLocalVars {
        MathError mathErr;
        uint256 underlyingPriceInUsd;
        uint256 underlyingValueInUsd;
    }

    function multiplyUnderlyingAmountByItsPriceInUsd(uint256 underlyingAmount)
        external
        override
        view
        returns (MathError, uint256)
    {
        MultiplyUnderlyingAmountLocalVars memory vars;
        vars.underlyingPriceInUsd = getUnderlyingPriceInUsd();
        (vars.mathErr, vars.underlyingValueInUsd) = mulUInt(underlyingAmount, vars.underlyingPriceInUsd);
        return (vars.mathErr, vars.underlyingValueInUsd);
    }
}
