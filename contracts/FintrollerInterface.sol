/* SPDX-License-Identifier: LPGL-3.0-or-later */
pragma solidity ^0.6.10;

import "./FintrollerStorage.sol";
import "./YTokenInterface.sol";

abstract contract FintrollerInterface is FintrollerStorage {
    /*** View Functions ***/
    function depositAllowed(YTokenInterface yToken) external virtual view returns (bool);

    function mintAllowed(YTokenInterface yToken) external virtual view returns (bool);

    /*** Non-Constant Functions ***/
    function setCollateralizationRatio(YTokenInterface yToken, uint256 newCollateralizationRatioMantissa_)
        external
        virtual
        returns (bool);

    function setOracle(DumbOracleInterface oracle_) external virtual returns (bool);

    event ListBond(YTokenInterface yToken);
    event NewCollateralizationRatio(
        YTokenInterface yToken,
        uint256 oldCollateralizationRatio,
        uint256 newCollateralizationRatio
    );
    event NewOracle(address oldOracle, address newOracle);

    /*** Admin Functions ***/
    function _listBond(YTokenInterface yToken) external virtual returns (bool);
}
