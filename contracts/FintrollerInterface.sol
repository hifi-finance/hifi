/* SPDX-License-Identifier: LPGL-3.0-or-later */
pragma solidity ^0.6.10;

import "./FintrollerStorage.sol";
import "./YTokenInterface.sol";

abstract contract FintrollerInterface is FintrollerStorage {
    /*** View Functions ***/
    function burnAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function depositCollateralAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function getBond(address yTokenAddress) external virtual view returns (uint256 collateralizationRatioMantissa);

    function mintAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function redeemAllowed(YTokenInterface yToken) external virtual view returns (bool);

    /*** Non-Constant Functions ***/
    function listBond(YTokenInterface yToken) external virtual returns (bool);

    function setCollateralizationRatio(YTokenInterface yToken, uint256 newCollateralizationRatioMantissa_)
        external
        virtual
        returns (bool);

    function setBurnAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setDepositCollateralAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setMintAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setRedeemAllowed(YTokenInterface yToken, bool state) external virtual returns (bool);

    function setOracle(SimpleOracleInterface oracle_) external virtual returns (bool);

    /*** Events ***/
    event ListBond(YTokenInterface indexed yToken);

    event NewCollateralizationRatio(
        YTokenInterface indexed yToken,
        uint256 oldCollateralizationRatio,
        uint256 newCollateralizationRatio
    );

    event SetBurnAllowed(YTokenInterface indexed yToken, bool state);

    event NewOracle(address oldOracle, address newOracle);

    event SetDepositCollateralAllowed(YTokenInterface indexed yToken, bool state);

    event SetMintAllowed(YTokenInterface indexed yToken, bool state);

    event SetRedeemAllowed(YTokenInterface indexed yToken, bool state);
}
