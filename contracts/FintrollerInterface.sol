/* SPDX-License-Identifier: LPGL-3.0-or-later */
pragma solidity ^0.7.1;

import "./FintrollerStorage.sol";
import "./YTokenInterface.sol";

abstract contract FintrollerInterface is FintrollerStorage {
    /**
     * CONSTANT FUNCTION
     */
    function borrowAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function depositCollateralAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function getBond(YTokenInterface yToken) external virtual view returns (uint256 collateralizationRatioMantissa);

    function redeemUnderlyingAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function repayBorrowAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function supplyUnderlyingAllowed(YTokenInterface yToken) external virtual view returns (bool);

    /**
     * NON-CONSTANT FUNCTIONS
     */
    function listBond(YTokenInterface yToken) external virtual returns (bool);

    function setBorrowAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setCollateralizationRatio(YTokenInterface yToken, uint256 newCollateralizationRatioMantissa)
        external
        virtual
        returns (bool);

    function setDepositCollateralAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setOracle(SimpleOracleInterface oracle_) external virtual returns (bool);

    function setRedeemUnderlyingAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setRepayBorrowAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setSupplyUnderlyingAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    /**
     * EVENTS
     */
    event ListBond(YTokenInterface indexed yToken);

    event NewCollateralizationRatio(
        YTokenInterface indexed yToken,
        uint256 oldCollateralizationRatio,
        uint256 newCollateralizationRatio
    );

    event NewOracle(address oldOracle, address newOracle);

    event SetDepositCollateralAllowed(YTokenInterface indexed yToken, bool state);

    event SetBorrowAllowed(YTokenInterface indexed yToken, bool state);

    event SetRedeemUnderlyingAllowed(YTokenInterface indexed yToken, bool state);

    event SetRepayBorrowAllowed(YTokenInterface indexed yToken, bool state);

    event SetSupplyUnderlyingAllowed(YTokenInterface indexed yToken, bool state);
}
