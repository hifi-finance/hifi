/* SPDX-License-Identifier: LPGL-3.0-or-later */
pragma solidity ^0.7.1;

import "./FintrollerStorage.sol";
import "./YTokenInterface.sol";

abstract contract FintrollerInterface is FintrollerStorage {
    /**
     * CONSTANT FUNCTIONS
     */

    function getBond(YTokenInterface yToken)
        external
        virtual
        view
        returns (
            uint256 thresholdCollateralizationRatioMantissa,
            bool isBorrowAllowed,
            bool isDepositCollateralAllowed,
            bool isListed,
            bool isRedeemUnderlyingAllowed,
            bool isRepayBorrowAllowed,
            bool isSupplyUnderlyingAllowed
        );

    function getBorrowAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function getBondThresholdCollateralizationRatio(YTokenInterface yToken) external virtual view returns (uint256);

    function getDepositCollateralAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function getRedeemUnderlyingAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function getRepayBorrowAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function getSupplyUnderlyingAllowed(YTokenInterface yToken) external virtual view returns (bool);

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

    function setOracle(UniswapAnchoredViewInterface oracle_) external virtual returns (bool);

    function setRedeemUnderlyingAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setRepayBorrowAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setSupplyUnderlyingAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    /**
     * EVENTS
     */
    event ListBond(address indexed admin, YTokenInterface indexed yToken);

    event NewCollateralizationRatio(
        address indexed admin,
        YTokenInterface indexed yToken,
        uint256 oldCollateralizationRatio,
        uint256 newCollateralizationRatio
    );

    event NewOracle(address indexed admin, address oldOracle, address newOracle);

    event SetDepositCollateralAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetBorrowAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetRedeemUnderlyingAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetRepayBorrowAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetSupplyUnderlyingAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);
}
