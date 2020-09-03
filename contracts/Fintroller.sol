/* SPDX-License-Identifier: LGPL-3.0-or-later */
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

    /*** View Functions ***/

    /**
     * @notice Checks if the user should be allowed to burn yTokens.
     * @dev Reverts it the bond is not listed.
     * @param yToken The bond to make the check against.
     * @return bool true=allowed, false=not allowed.
     */
    function burnAllowed(YTokenInterface yToken) external override view returns (bool) {
        Bond memory bond = bonds[address(yToken)];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isBurnAllowed;
    }

    /**
     * @notice Checks if the user should be allowed to deposit new collateral.
     * @dev Reverts it the bond is not listed.
     * @param yToken The bond to make the check against.
     * @return bool true=allowed, false=not allowed.
     */
    function depositCollateralAllowed(YTokenInterface yToken) external override view returns (bool) {
        Bond memory bond = bonds[address(yToken)];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isDepositCollateralAllowed;
    }

    /**
     * @notice Checks if the user should be allowed to mint new yTokens.
     * @dev Reverts it the bond is not listed.
     * @param yToken The bond to make the check against.
     * @return bool true=allowed, false=not allowed.
     */
    function mintAllowed(YTokenInterface yToken) external override view returns (bool) {
        Bond memory bond = bonds[address(yToken)];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isMintAllowed;
    }

    /**
     * @notice Checks if the user should be allowed to redeem yTokens for the underlying asset.
     * @dev Reverts it the bond is not listed.
     * @param yToken The bond to make the check against.
     * @return bool true=allowed, false=not allowed.
     */
    function redeemAllowed(YTokenInterface yToken) external override view returns (bool) {
        Bond memory bond = bonds[address(yToken)];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isRedeemAllowed;
    }

    /*** Non-Constant Functions ***/

    /**
     * @notice Marks the bond as listed in this contract's registry. It is not an error to list a bond twice.
     *
     * @dev Emits a {ListBond} event.
     *
     * Requirements:
     * - caller must be the administrator
     *
     * @param yToken The yToken contract to list.
     * @return bool true=success, otherwise it reverts.
     */
    function listBond(YTokenInterface yToken) external override isAuthorized returns (bool) {
        /* Sanity check */
        yToken.isYToken();
        bonds[address(yToken)] = Bond({
            thresholdCollateralizationRatio: Exp({ mantissa: defaultCollateralizationRatioMantissa }),
            isBurnAllowed: false,
            isDepositCollateralAllowed: false,
            isListed: true,
            isMintAllowed: false,
            isRedeemAllowed: false
        });
        emit ListBond(yToken);
        return NO_ERROR;
    }

    /**
     * @notice Returns the bond with all its properties.
     * @dev It is not an error to provide an invalid yToken address. The returned values will all be zero.
     * @param yTokenAddress The address of the bond contract.
     * @return collateralizationRatioMantissa The bond data.
     */
    function getBond(address yTokenAddress) external override view returns (uint256 collateralizationRatioMantissa) {
        collateralizationRatioMantissa = bonds[yTokenAddress].thresholdCollateralizationRatio.mantissa;
    }

    struct SetCollateralizationRatioLocalVars {
        address yTokenAddress;
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
     * @param yToken The bond for which to update the collateralization ratio.
     * @param newCollateralizationRatioMantissa_ The mantissa value of the new collateralization ratio.
     * @return bool true=success, otherwise it reverts.
     */
    function setCollateralizationRatio(YTokenInterface yToken, uint256 newCollateralizationRatioMantissa_)
        external
        override
        isAuthorized
        returns (bool)
    {
        SetCollateralizationRatioLocalVars memory vars;
        vars.yTokenAddress = address(yToken);

        require(bonds[vars.yTokenAddress].isListed, "ERR_BOND_NOT_LISTED");
        require(
            newCollateralizationRatioMantissa_ <= collateralizationRatioUpperBoundMantissa,
            "ERR_SET_COLLATERALIZATION_RATIO_OVERFLOW"
        );
        require(
            newCollateralizationRatioMantissa_ >= collateralizationRatioLowerBoundMantissa,
            "ERR_SET_COLLATERALIZATION_RATIO_UNDERFLOW"
        );

        uint256 oldCollateralizationRatioMantissa = bonds[vars.yTokenAddress].thresholdCollateralizationRatio.mantissa;
        bonds[vars.yTokenAddress].thresholdCollateralizationRatio = Exp({
            mantissa: newCollateralizationRatioMantissa_
        });

        emit NewCollateralizationRatio(yToken, oldCollateralizationRatioMantissa, newCollateralizationRatioMantissa_);
        return NO_ERROR;
    }

    /**
     * @notice Sets the state of the permission accessed by the yToken before a burn.
     *
     * @dev Emits a {SetBurnAllowed} event.
     *
     * Requirements:
     * - caller must be the administrator
     *
     * @param yToken The yToken contract to update the permission for.
     * @param state The new state to be put in storage.
     * @return bool true=success, otherwise it reverts.
     */
    function setBurnAllowed(YTokenInterface yToken, bool state) external override isAuthorized returns (bool) {
        require(bonds[address(yToken)].isListed, "ERR_BOND_NOT_LISTED");
        bonds[address(yToken)].isBurnAllowed = state;
        emit SetBurnAllowed(yToken, state);
        return NO_ERROR;
    }

    /**
     * @notice Sets the state of the permission accessed by the yToken before a new collateral deposit.
     *
     * @dev Emits a {SetDepositCollateralAllowed} event.
     *
     * Requirements:
     * - caller must be the administrator
     *
     * @param yToken The yToken contract to update the permission for.
     * @param state The new state to be put in storage.
     * @return bool true=success, otherwise it reverts.
     */
    function setDepositCollateralAllowed(YTokenInterface yToken, bool state)
        external
        override
        isAuthorized
        returns (bool)
    {
        require(bonds[address(yToken)].isListed, "ERR_BOND_NOT_LISTED");
        bonds[address(yToken)].isDepositCollateralAllowed = state;
        emit SetDepositCollateralAllowed(yToken, state);
        return NO_ERROR;
    }

    /**
     * @notice Sets the state of the permission accessed by the yToken before a new mint.
     *
     * @dev Emits a {SetMintAllowed} event.
     *
     * Requirements:
     * - caller must be the administrator
     *
     * @param yToken The yToken contract to update the permission for.
     * @param state The new state to be put in storage.
     * @return bool true=success, otherwise it reverts.
     */
    function setMintAllowed(YTokenInterface yToken, bool state) external override isAuthorized returns (bool) {
        require(bonds[address(yToken)].isListed, "ERR_BOND_NOT_LISTED");
        bonds[address(yToken)].isMintAllowed = state;
        emit SetMintAllowed(yToken, state);
        return NO_ERROR;
    }

    /**
     * @notice Sets the state of the permission accessed by the yToken before an underlying redemption.
     *
     * @dev Emits a {SetRedeemAllowed} event.
     *
     * Requirements:
     * - caller must be the administrator
     *
     * @param yToken The yToken contract to update the permission for.
     * @param state The new state to be put in storage.
     * @return bool true=success, otherwise it reverts.
     */
    function setRedeemAllowed(YTokenInterface yToken, bool state) external override isAuthorized returns (bool) {
        require(bonds[address(yToken)].isListed, "ERR_BOND_NOT_LISTED");
        bonds[address(yToken)].isRedeemAllowed = state;
        emit SetRedeemAllowed(yToken, state);
        return NO_ERROR;
    }

    /**
     * @notice Updates the oracle contract's address saved in storage.
     *
     * @dev Emits a {SetOracle} event.
     *
     * Requirements:
     * - caller must be the administrator
     * - the new address must not be the zero address
     *
     * @param oracle_ The new oracle contract.
     * @return bool true=success, otherwise it reverts.
     */
    function setOracle(SimpleOracleInterface oracle_) external override isAuthorized returns (bool) {
        require(address(oracle_) != address(0x00), "ERR_SET_ORACLE_ZERO_ADDRESS");
        address oldOracle = address(oracle);
        oracle = oracle_;
        emit NewOracle(oldOracle, address(oracle));
        return NO_ERROR;
    }
}
