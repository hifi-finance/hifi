/* SPDX-License-Identifier: LPGL-3.0-or-later */
pragma solidity ^0.7.1;

import "./FintrollerStorage.sol";
import "./GuarantorPoolInterface.sol";
import "./YTokenInterface.sol";

abstract contract FintrollerInterface is FintrollerStorage {
    /**
     * CONSTANT FUNCTIONS
     */
    function borrowAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function depositCollateralAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function depositGuarantyAllowed(GuarantorPoolInterface guarantorPool) external virtual view returns (bool);

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

    function getBondThresholdCollateralizationRatio(YTokenInterface yToken) external virtual view returns (uint256);

    function getGuarantorPool(GuarantorPoolInterface guarantorPool)
        external
        virtual
        view
        returns (
            bool isDepositGuarantyAllowed,
            bool isListed,
            bool isWithdrawGuarantyAndClutchedCollateralAllowed
        );

    function redeemUnderlyingAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function repayBorrowAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function supplyUnderlyingAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function withdrawGuarantyAndClutchedCollateralAllowed(GuarantorPoolInterface guarantorPool)
        external
        virtual
        view
        returns (bool);

    /**
     * NON-CONSTANT FUNCTIONS
     */
    function listBond(YTokenInterface yToken) external virtual returns (bool);

    function listGuarantorPool(GuarantorPoolInterface guarantorPool) external virtual returns (bool);

    function setBorrowAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setCollateralizationRatio(YTokenInterface yToken, uint256 newCollateralizationRatioMantissa)
        external
        virtual
        returns (bool);

    function setDepositCollateralAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setDepositGuarantyAllowed(GuarantorPoolInterface guarantorPool, bool state)
        external
        virtual
        returns (bool);

    function setOracle(UniswapAnchoredViewInterface oracle_) external virtual returns (bool);

    function setRedeemUnderlyingAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setRepayBorrowAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setSupplyUnderlyingAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setWithdrawGuarantyAndClutchedCollateralAllowed(GuarantorPoolInterface guarantorPool, bool state)
        external
        virtual
        returns (bool);

    /**
     * EVENTS
     */
    event ListBond(address indexed admin, YTokenInterface indexed yToken);

    event ListGuarantorPool(address indexed admin, GuarantorPoolInterface indexed guarantorPool);

    event NewCollateralizationRatio(
        address indexed admin,
        YTokenInterface indexed yToken,
        uint256 oldCollateralizationRatio,
        uint256 newCollateralizationRatio
    );

    event NewOracle(address indexed admin, address oldOracle, address newOracle);

    event SetDepositCollateralAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetDepositGuarantyAllowed(address indexed admin, GuarantorPoolInterface indexed guarantorPool, bool state);

    event SetBorrowAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetRedeemUnderlyingAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetRepayBorrowAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetSupplyUnderlyingAllowed(address indexed admin, YTokenInterface indexed yToken, bool state);

    event SetWithdrawGuarantyAndClutchedCollateralAllowed(
        address indexed admin,
        GuarantorPoolInterface indexed guarantorPool,
        bool state
    );
}
