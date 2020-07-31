/* SDPX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";
import "./math/Exponential.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";

/**
 * @notice Fintroller
 * @author Mainframe
 */
contract Fintroller is FintrollerInterface, Admin, ErrorReporter {
    /* solhint-disable-next-line */
    constructor() public Admin() {}

    /**
     * @notice Marks the bond as listed in this contract's registry. It is not an error to list a bond twice.
     *
     * @dev Emits a {ListBond} event.
     *
     * Requirements:
     * - caller must be the administrator
     *
     * @param bond The bond contract to list.
     * @return bool true=success, otherwise it reverts.
     */
    function listBond(YTokenInterface bond) external override returns (bool) {
        /* Sanity check */
        bond.isYToken();
        bonds[address(bond)].isListed = true;
        emit ListBond(bond);
        return NO_ERROR;
    }

    struct SetCollateralizationRatioLocalVars {
        address bondAddress;
    }

    /**
     * @notice Updates the collateralization ratio that ensures that the protocol is
     * sufficiently collateralized.
     *
     * @dev Emits a {SetCollateralizationRatio} event.
     *
     * Requirements:
     * - caller must be the administrator
     * - the bond must be listed
     * - `newCollateralizationRatioMantissa_` cannot be higher than 10,000%
     * - `newCollateralizationRatioMantissa_` cannot be lower than 100%
     *
     * @param bond The bond for which to update the collateralization ratio.
     * @param newCollateralizationRatioMantissa_ The mantissa value of the new collateralization ratio.
     * @return bool true=success, otherwise it reverts.
     */
    function setCollateralizationRatio(YTokenInterface bond, uint256 newCollateralizationRatioMantissa_)
        external
        isAuthorized
        returns (bool)
    {
        SetCollateralizationRatioLocalVars memory vars;
        vars.bondAddress = address(bond);

        require(bonds[vars.bondAddress].isListed, "ERR_SET_COLLATERALIZATION_RATIO_BOND_NOT_LISTED");
        require(
            newCollateralizationRatioMantissa_ <= collateralizationRatioUpperBoundMantissa,
            "ERR_SET_COLLATERALIZATION_RATIO_OVERFLOW"
        );
        require(
            newCollateralizationRatioMantissa_ >= collateralizationRatioLowerBoundMantissa,
            "ERR_SET_COLLATERALIZATION_RATIO_UNDERFLOW"
        );

        uint256 oldCollateralizationRatioMantissa = bonds[vars.bondAddress].collateralizationRatio.mantissa;
        bonds[vars.bondAddress].collateralizationRatio = Exp({ mantissa: newCollateralizationRatioMantissa_ });

        emit NewCollateralizationRatio(
            vars.bondAddress,
            oldCollateralizationRatioMantissa,
            newCollateralizationRatioMantissa_
        );
        return NO_ERROR;
    }

    /**
     * @notice Updates the oracle contract's address saved in storage.
     *
     * @dev Emits a {SetOracle} event.
     *
     * Requirements:
     * - caller must be the administrator
     *
     * @param oracle_ The new oracle contract.
     * @return bool true=success, otherwise it reverts.
     */
    function setOracle(DumbOracleInterface oracle_) external isAuthorized returns (bool) {
        address oldOracle = address(oracle);
        oracle = oracle_;
        emit NewOracle(oldOracle, address(oracle));
        return NO_ERROR;
    }
}
