/* SDPX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./Admin.sol";
import "./FintrollerStorage.sol";
import "../math/Exponential.sol";

contract Fintroller is FintrollerStorage, Admin {
    /* solhint-disable-next-line */
    constructor() public Admin() {}

    /**
     * @notice Updates the collateralization ratio saved in storage.
     * @dev Reverts if not called by the administrator.
     * @param collateralizationRatio_ The uint256 value of the new collateralization ratio.
     * @return bool true=success, otherwise it reverts.
     */
    function setCollateralizationRatio(uint256 collateralizationRatio_) external isAuthorized returns (bool) {
        collateralizationRatio = Exp({ mantissa: collateralizationRatio_ });
        return true;
    }

    /**
     * @notice Updates the oracle contract's address saved in storage.
     * @dev Reverts if not called by the administrator.
     * @param oracle_ The address of the oracle contract.
     * @return bool true=success, otherwise it reverts.
     */
    function setOracle(address oracle_) external isAuthorized returns (bool) {
        oracle = oracle_;
        return true;
    }
}
