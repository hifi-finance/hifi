/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";
import "./math/Exponential.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";

/**
 * @notice Fintroller
 * @author Mainframe
 */
contract Fintroller is
    ErrorReporter, /* no depedency */
    FintrollerInterface, /* one dependency */
    Admin /* two dependencies */
{
    /* solhint-disable-next-line no-empty-blocks */
    constructor() Admin() {}

    /**
     * CONSTANT FUNCTIONS
     */

    /**
     * @notice Reads all the storage properties of a bond struct.
     * @dev It is not an error to provide an invalid yToken address. The returned values would all be zero.
     * @param yToken The address of the bond contract.
     */
    function getBond(YTokenInterface yToken)
        external
        override
        view
        returns (
            uint256 thresholdCollateralizationRatioMantissa,
            bool isBorrowAllowed,
            bool isDepositCollateralAllowed,
            bool isListed,
            bool isRedeemUnderlyingAllowed,
            bool isRepayBorrowAllowed,
            bool isSupplyUnderlyingAllowed
        )
    {
        thresholdCollateralizationRatioMantissa = bonds[address(yToken)].thresholdCollateralizationRatio.mantissa;
        isBorrowAllowed = bonds[address(yToken)].isBorrowAllowed;
        isDepositCollateralAllowed = bonds[address(yToken)].isDepositCollateralAllowed;
        isListed = bonds[address(yToken)].isListed;
        isRedeemUnderlyingAllowed = bonds[address(yToken)].isRedeemUnderlyingAllowed;
        isRepayBorrowAllowed = bonds[address(yToken)].isRepayBorrowAllowed;
        isSupplyUnderlyingAllowed = bonds[address(yToken)].isSupplyUnderlyingAllowed;
    }

    /**
     * @notice Reads the threshold collateralization ratio of the given bond.
     * @dev It is not an error to provide an invalid yToken address.
     * @param yToken The address of the bond contract.
     * @return The threshold collateralization ratio as a uint256, or zero if an invalid address was provided.
     */
    function getBondThresholdCollateralizationRatio(YTokenInterface yToken) external override view returns (uint256) {
        return bonds[address(yToken)].thresholdCollateralizationRatio.mantissa;
    }

    /**
     * @notice Check if the account should be allowed to borrow yTokens.
     * @dev Reverts it the bond is not listed.
     * @param yToken The bond to make the check against.
     * @return bool true=allowed, false=not allowed.
     */
    function getBorrowAllowed(YTokenInterface yToken) external override view returns (bool) {
        Bond memory bond = bonds[address(yToken)];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isBorrowAllowed;
    }

    /**
     * @notice Checks if the account should be allowed to deposit new collateral.
     * @dev Reverts it the bond is not listed.
     * @param yToken The bond to make the check against.
     * @return bool true=allowed, false=not allowed.
     */
    function getDepositCollateralAllowed(YTokenInterface yToken) external override view returns (bool) {
        Bond memory bond = bonds[address(yToken)];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isDepositCollateralAllowed;
    }

    /**
     * @notice Checks if the account should be allowed to redeem the underlying asset from the Redemption Pool.
     * @dev Reverts it the bond is not listed.
     * @param yToken The bond to make the check against.
     * @return bool true=allowed, false=not allowed.
     */
    function getRedeemUnderlyingAllowed(YTokenInterface yToken) external override view returns (bool) {
        Bond memory bond = bonds[address(yToken)];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isRedeemUnderlyingAllowed;
    }

    /**
     * @notice Checks if the account should be allowed to repay borrows.
     * @dev Reverts it the bond is not listed.
     * @param yToken The bond to make the check against.
     * @return bool true=allowed, false=not allowed.
     */
    function getRepayBorrowAllowed(YTokenInterface yToken) external override view returns (bool) {
        Bond memory bond = bonds[address(yToken)];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isRepayBorrowAllowed;
    }

    /**
     * @notice Checks if the account should be allowed to the supply underlying asset to the Redemption Pool.
     * @dev Reverts it the bond is not listed.
     * @param yToken The bond to make the check against.
     * @return bool true=allowed, false=not allowed.
     */
    function getSupplyUnderlyingAllowed(YTokenInterface yToken) external override view returns (bool) {
        Bond memory bond = bonds[address(yToken)];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isSupplyUnderlyingAllowed;
    }

    /**
     * NON-CONSTANT FUNCTIONS
     */

    /**
     * @notice Marks the bond as listed in this Fintroller's registry. It is not an error to list a bond twice.
     *
     * @dev Emits a {ListBond} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator
     *
     * @param yToken The yToken contract to list.
     * @return bool true=success, otherwise it reverts.
     */
    function listBond(YTokenInterface yToken) external override onlyAdmin returns (bool) {
        yToken.isYToken();
        bonds[address(yToken)] = Bond({
            isBorrowAllowed: false,
            isDepositCollateralAllowed: false,
            isListed: true,
            isRedeemUnderlyingAllowed: false,
            isRepayBorrowAllowed: false,
            isSupplyUnderlyingAllowed: false,
            thresholdCollateralizationRatio: Exp({ mantissa: defaultCollateralizationRatioMantissa })
        });
        emit ListBond(admin, yToken);
        return NO_ERROR;
    }

    struct SetCollateralizationRatioLocalVars {
        uint256 oldCollateralizationRatioMantissa;
        address yTokenAddress;
    }

    /**
     * @notice Updates the state of the permission accessed by the yToken before a borrow.
     *
     * @dev Emits a {SetBorrowAllowed} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator
     *
     * @param yToken The yToken contract to update the permission for.
     * @param state The new state to be put in storage.
     * @return bool true=success, otherwise it reverts.
     */
    function setBorrowAllowed(YTokenInterface yToken, bool state) external override onlyAdmin returns (bool) {
        require(bonds[address(yToken)].isListed, "ERR_BOND_NOT_LISTED");
        bonds[address(yToken)].isBorrowAllowed = state;
        emit SetBorrowAllowed(admin, yToken, state);
        return NO_ERROR;
    }

    /**
     * @notice Updates the collateralization ratio, which ensures that the protocol is sufficiently collateralized.
     *
     * @dev Emits a {SetCollateralizationRatio} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator
     * - the bond must be listed
     * - `newCollateralizationRatioMantissa` cannot be higher than 10,000%
     * - `newCollateralizationRatioMantissa` cannot be lower than 100%
     *
     * @param yToken The bond for which to update the collateralization ratio.
     * @param newCollateralizationRatioMantissa The mantissa value of the new collateralization ratio.
     * @return bool true=success, otherwise it reverts.
     */
    function setCollateralizationRatio(YTokenInterface yToken, uint256 newCollateralizationRatioMantissa)
        external
        override
        onlyAdmin
        returns (bool)
    {
        SetCollateralizationRatioLocalVars memory vars;
        vars.yTokenAddress = address(yToken);

        /* Checks: bond is listed. */
        require(bonds[vars.yTokenAddress].isListed, "ERR_BOND_NOT_LISTED");

        /* Checks: collateralization ratio is within the accepted bounds. */
        require(
            newCollateralizationRatioMantissa <= collateralizationRatioUpperBoundMantissa,
            "ERR_SET_COLLATERALIZATION_RATIO_OVERFLOW"
        );
        require(
            newCollateralizationRatioMantissa >= collateralizationRatioLowerBoundMantissa,
            "ERR_SET_COLLATERALIZATION_RATIO_UNDERFLOW"
        );

        /* Effects */
        vars.oldCollateralizationRatioMantissa = bonds[vars.yTokenAddress].thresholdCollateralizationRatio.mantissa;
        bonds[vars.yTokenAddress].thresholdCollateralizationRatio = Exp({
            mantissa: newCollateralizationRatioMantissa
        });

        emit NewCollateralizationRatio(
            admin,
            yToken,
            vars.oldCollateralizationRatioMantissa,
            newCollateralizationRatioMantissa
        );

        return NO_ERROR;
    }

    /**
     * @notice Updates the state of the permission accessed by the yToken before a new collateral deposit.
     *
     * @dev Emits a {SetDepositCollateralAllowed} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator
     *
     * @param yToken The yToken contract to update the permission for.
     * @param state The new state to be put in storage.
     * @return bool true=success, otherwise it reverts.
     */
    function setDepositCollateralAllowed(YTokenInterface yToken, bool state)
        external
        override
        onlyAdmin
        returns (bool)
    {
        require(bonds[address(yToken)].isListed, "ERR_BOND_NOT_LISTED");
        bonds[address(yToken)].isDepositCollateralAllowed = state;
        emit SetDepositCollateralAllowed(admin, yToken, state);
        return NO_ERROR;
    }

    /**
     * @notice Updates the oracle contract's address saved in storage.
     *
     * @dev Emits a {SetOracle} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator
     * - The new address cannot be the zero address
     *
     * @param oracle_ The new oracle contract.
     * @return bool true=success, otherwise it reverts.
     */
    function setOracle(UniswapAnchoredViewInterface oracle_) external override onlyAdmin returns (bool) {
        require(address(oracle_) != address(0x00), "ERR_SET_ORACLE_ZERO_ADDRESS");
        address oldOracle = address(oracle);
        oracle = oracle_;
        emit NewOracle(admin, oldOracle, address(oracle));
        return NO_ERROR;
    }

    /**
     * @notice Updates the state of the permission accessed by the Redemption Pool before a redemption of underlying.
     *
     * @dev Emits a {SetRedeemUnderlyingAllowed} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator
     *
     * @param yToken The yToken contract to update the permission for.
     * @param state The new state to be put in storage.
     * @return bool true=success, otherwise it reverts.
     */
    function setRedeemUnderlyingAllowed(YTokenInterface yToken, bool state) external override onlyAdmin returns (bool) {
        require(bonds[address(yToken)].isListed, "ERR_BOND_NOT_LISTED");
        bonds[address(yToken)].isRedeemUnderlyingAllowed = state;
        emit SetRedeemUnderlyingAllowed(admin, yToken, state);
        return NO_ERROR;
    }

    /**
     * @notice Updates the state of the permission accessed by the yToken before a repay borrow.
     *
     * @dev Emits a {SetRepayBorrowAllowed} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator
     *
     * @param yToken The yToken contract to update the permission for.
     * @param state The new state to be put in storage.
     * @return bool true=success, otherwise it reverts.
     */
    function setRepayBorrowAllowed(YTokenInterface yToken, bool state) external override onlyAdmin returns (bool) {
        require(bonds[address(yToken)].isListed, "ERR_BOND_NOT_LISTED");
        bonds[address(yToken)].isRepayBorrowAllowed = state;
        emit SetRepayBorrowAllowed(admin, yToken, state);
        return NO_ERROR;
    }

    /**
     * @notice Updates the state of the permission accessed by the Redemption Pool before a supply of underlying.
     *
     * @dev Emits a {SetSupplyUnderlyingAllowed} event.
     *
     * Requirements:
     * - The caller must be the administrator
     *
     * @param yToken The yToken contract to update the permission for.
     * @param state The new state to be put in storage.
     * @return bool true=success, otherwise it reverts.
     */
    function setSupplyUnderlyingAllowed(YTokenInterface yToken, bool state) external override onlyAdmin returns (bool) {
        require(bonds[address(yToken)].isListed, "ERR_BOND_NOT_LISTED");
        bonds[address(yToken)].isSupplyUnderlyingAllowed = state;
        emit SetSupplyUnderlyingAllowed(admin, yToken, state);
        return NO_ERROR;
    }
}
