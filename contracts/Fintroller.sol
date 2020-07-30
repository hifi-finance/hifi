/* SDPX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./FintrollerInterface.sol";
import "./math/Exponential.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";

contract Fintroller is FintrollerInterface, Admin, ErrorReporter {
    /* solhint-disable-next-line */
    constructor() public Admin() {}

    /**
     * @notice Updates the collateralization ratio that ensures that the protocol is
     * sufficiently collateralized.
     *
     * @dev Emits a {SetCollateralizationRatio} event.
     *
     * Requirements:
     * - caller must be the administrator
     * - `newCollateralizationRatioMantissa_` cannot be higher than 10,000%
     * - `newCollateralizationRatioMantissa_` cannot be lower than 100%
     *
     * @param newCollateralizationRatioMantissa_ The mantissa value of the new collateralization ratio.
     * @return bool true=success, otherwise it reverts.
     */
    function setCollateralizationRatio(uint256 newCollateralizationRatioMantissa_)
        external
        isAuthorized
        returns (bool)
    {
        require(
            newCollateralizationRatioMantissa_ <= COLLATERALIZATION_RATIO_UPPER_BOUND_MANTISSA,
            "ERR_SET_COLLATERALIZATION_RATIO_OVERFLOW"
        );
        require(
            newCollateralizationRatioMantissa_ >= COLLATERALIZATION_RATIO_LOWER_BOUND_MANTISSA,
            "ERR_SET_COLLATERALIZATION_RATIO_UNDERFLOW"
        );
        collateralizationRatio = Exp({ mantissa: newCollateralizationRatioMantissa_ });
        emit NewCollateralizationRatio(newCollateralizationRatioMantissa_);
        return NO_ERROR;
    }

    /**
     * @notice Updates the oracle contract's address saved in storage.
     *
     * @dev Reverts if not called by the administrator.
     *
     * @param oracle_ The address of the oracle contract.
     * @return bool true=success, otherwise it reverts.
     */
    function setOracle(address oracle_) external isAuthorized returns (bool) {
        oracle = oracle_;
        return NO_ERROR;
    }
}
