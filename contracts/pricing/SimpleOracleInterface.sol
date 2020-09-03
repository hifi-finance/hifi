/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "../math/CarefulMath.sol";
import "./SimpleOracleStorage.sol";

/**
 * @title SimpleOracle
 * @author Mainframe
 * @dev Strictly for testing purposes. Do not use in production.
 */
abstract contract SimpleOracleInterface is SimpleOracleStorage, CarefulMath {
    function getCollateralPriceInUsd() public virtual view returns (uint256);

    function getUnderlyingPriceInUsd() public virtual view returns (uint256);

    function multiplyCollateralAmountByItsPriceInUsd(uint256 collateralAmount)
        external
        virtual
        view
        returns (MathError, uint256);

    function multiplyUnderlyingAmountByItsPriceInUsd(uint256 underlyingAmount)
        external
        virtual
        view
        returns (MathError, uint256);
}
