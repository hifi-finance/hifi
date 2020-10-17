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
        view
        virtual
        returns (
            uint256 debtCeiling,
            uint256 collateralizationRatioMantissa,
            bool isBorrowAllowed,
            bool isDepositCollateralAllowed,
            bool isLiquidateBorrowAllowed,
            bool isListed,
            bool isRedeemYTokenAllowed,
            bool isRepayBorrowAllowed,
            bool isSupplyUnderlyingAllowed
        );

    function getBorrowAllowed(YTokenInterface yToken) external view virtual returns (bool);

    function getBondDebtCeiling(YTokenInterface yToken) external view virtual returns (uint256);

    function getBondCollateralizationRatio(YTokenInterface yToken) external view virtual returns (uint256);

    function getDepositCollateralAllowed(YTokenInterface yToken) external view virtual returns (bool);

    function getLiquidateBorrowAllowed(YTokenInterface yToken) external view virtual returns (bool);

    function getRedeemYTokensAllowed(YTokenInterface yToken) external view virtual returns (bool);

    function getRepayBorrowAllowed(YTokenInterface yToken) external view virtual returns (bool);

    function getSupplyUnderlyingAllowed(YTokenInterface yToken) external view virtual returns (bool);

    /**
     * NON-CONSTANT FUNCTIONS
     */

    function listBond(YTokenInterface yToken) external virtual returns (bool);

    function setBorrowAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setCollateralizationRatio(YTokenInterface yToken, uint256 newCollateralizationRatioMantissa)
        external
        virtual
        returns (bool);

    function setDebtCeiling(YTokenInterface yToken, uint256 newDebtCeiling) external virtual returns (bool);

    function setDepositCollateralAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setLiquidateBorrowAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setLiquidationIncentive(uint256 newLiquidationIncentiveMantissa) external virtual returns (bool);

    function setOracle(UniswapAnchoredViewInterface oracle_) external virtual returns (bool);

    function setRedeemYTokensAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setRepayBorrowAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setSupplyUnderlyingAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    /**
     * EVENTS
     */
    event ListBond(address indexed admin, YTokenInterface indexed yToken);

    event SetBorrowAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetCollateralizationRatio(
        address indexed admin,
        YTokenInterface indexed yToken,
        uint256 oldCollateralizationRatio,
        uint256 newCollateralizationRatio
    );

    event SetDebtCeiling(
        address indexed admin,
        YTokenInterface indexed yToken,
        uint256 oldDebtCeiling,
        uint256 newDebtCeiling
    );

    event SetDepositCollateralAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetLiquidateBorrowAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetLiquidationIncentive(
        address indexed admin,
        uint256 oldLiquidationIncentive,
        uint256 newLiquidationIncentive
    );

    event SetRedeemYTokensAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetRepayBorrowAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetOracle(address indexed admin, address oldOracle, address newOracle);

    event SetSupplyUnderlyingAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);
}
