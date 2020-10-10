/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";
import "./erc20/Erc20Recover.sol";
import "./math/Exponential.sol";
import "./utils/Admin.sol";

/**
 * @notice Fintroller
 * @author Mainframe
 */
contract Fintroller is
    FintrollerInterface, /* one dependency */
    Admin, /* two dependencies */
    Erc20Recover /* five dependencies */
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
            uint256 collateralizationRatioMantissa,
            uint256 debtCeiling,
            bool isBorrowAllowed,
            bool isDepositCollateralAllowed,
            bool isListed,
            bool isRedeemUnderlyingAllowed,
            bool isRepayBorrowAllowed,
            bool isSupplyUnderlyingAllowed
        )
    {
        collateralizationRatioMantissa = bonds[address(yToken)].collateralizationRatio.mantissa;
        debtCeiling = bonds[address(yToken)].debtCeiling;
        isBorrowAllowed = bonds[address(yToken)].isBorrowAllowed;
        isDepositCollateralAllowed = bonds[address(yToken)].isDepositCollateralAllowed;
        isListed = bonds[address(yToken)].isListed;
        isRedeemUnderlyingAllowed = bonds[address(yToken)].isRedeemUnderlyingAllowed;
        isRepayBorrowAllowed = bonds[address(yToken)].isRepayBorrowAllowed;
        isSupplyUnderlyingAllowed = bonds[address(yToken)].isSupplyUnderlyingAllowed;
    }

    /**
     * @notice Reads the debt ceiling of the given bond.
     * @dev It is not an error to provide an invalid yToken address.
     * @param yToken The address of the bond contract.
     * @return The debt ceiling as a uint256, or zero if an invalid address was provided.
     */
    function getBondDebtCeiling(YTokenInterface yToken) external override view returns (uint256) {
        return bonds[address(yToken)].debtCeiling;
    }

    /**
     * @notice Reads the collateralization ratio of the given bond.
     * @dev It is not an error to provide an invalid yToken address.
     * @param yToken The address of the bond contract.
     * @return The collateralization ratio as a mantissa, or zero if an invalid address was provided.
     */
    function getBondCollateralizationRatio(YTokenInterface yToken) external override view returns (uint256) {
        return bonds[address(yToken)].collateralizationRatio.mantissa;
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
     * @notice Check if the account should be allowed to liquidate yToken borrows.
     * @dev Reverts it the bond is not listed.
     * @param yToken The bond to make the check against.
     * @return bool true=allowed, false=not allowed.
     */
    function getLiquidateBorrowAllowed(YTokenInterface yToken) external override view returns (bool) {
        yToken;
        return true;
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
     * - The caller must be the administrator.
     *
     * @param yToken The yToken contract to list.
     * @return bool true=success, otherwise it reverts.
     */
    function listBond(YTokenInterface yToken) external override onlyAdmin returns (bool) {
        yToken.isYToken();
        bonds[address(yToken)] = Bond({
            collateralizationRatio: Exp({ mantissa: defaultCollateralizationRatioMantissa }),
            debtCeiling: 0,
            isBorrowAllowed: false,
            isDepositCollateralAllowed: false,
            isListed: true,
            isRedeemUnderlyingAllowed: false,
            isRepayBorrowAllowed: false,
            isSupplyUnderlyingAllowed: false
        });
        emit ListBond(admin, yToken);
        return true;
    }

    /**
     * @notice Updates the state of the permission accessed by the yToken before a borrow.
     *
     * @dev Emits a {SetBorrowAllowed} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator.
     *
     * @param yToken The yToken contract to update the permission for.
     * @param state The new state to be put in storage.
     * @return bool true=success, otherwise it reverts.
     */
    function setBorrowAllowed(YTokenInterface yToken, bool state) external override onlyAdmin returns (bool) {
        require(bonds[address(yToken)].isListed, "ERR_BOND_NOT_LISTED");
        bonds[address(yToken)].isBorrowAllowed = state;
        emit SetBorrowAllowed(admin, yToken, state);
        return true;
    }

    struct SetCollateralizationRatioLocalVars {
        uint256 oldCollateralizationRatioMantissa;
        address yTokenAddress;
    }

    /**
     * @notice Updates the collateralization ratio, which ensures that the bond market is sufficiently collateralized.
     *
     * @dev Emits a {SetCollateralizationRatio} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator.
     * - The bond must be listed.
     * - The new collateralization ratio cannot be higher than 10,000%.
     * - The new collateralization ratio cannot be lower than 100%.
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
        vars.oldCollateralizationRatioMantissa = bonds[vars.yTokenAddress].collateralizationRatio.mantissa;
        bonds[vars.yTokenAddress].collateralizationRatio = Exp({ mantissa: newCollateralizationRatioMantissa });

        emit SetCollateralizationRatio(
            admin,
            yToken,
            vars.oldCollateralizationRatioMantissa,
            newCollateralizationRatioMantissa
        );

        return true;
    }

    struct SetDebtCeilingVars {
        uint256 oldDebtCeiling;
        address yTokenAddress;
    }

    /**
     * @notice Updates the debt ceiling, which limits how much debt can be created in the bond market.
     *
     * @dev Emits a {SetDebtCeiling} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator.
     * - The bond must be listed.
     * - The debt ceiling cannot be zero.
     *
     * @param yToken The bond for which to update the debt ceiling.
     * @param newDebtCeiling The uint256 value of the new debt ceiling, specified in the bond's decimal system.
     * @return bool true=success, otherwise it reverts.
     */
    function setDebtCeiling(YTokenInterface yToken, uint256 newDebtCeiling) external override onlyAdmin returns (bool) {
        SetDebtCeilingVars memory vars;
        vars.yTokenAddress = address(yToken);

        /* Checks: bond is listed. */
        require(bonds[vars.yTokenAddress].isListed, "ERR_BOND_NOT_LISTED");

        /* Checks: the zero edge case. */
        require(newDebtCeiling > 0, "ERR_SET_DEBT_CEILING_ZERO");

        /* Effects */
        vars.oldDebtCeiling = bonds[vars.yTokenAddress].debtCeiling;
        bonds[vars.yTokenAddress].debtCeiling = newDebtCeiling;

        emit SetDebtCeiling(admin, yToken, vars.oldDebtCeiling, newDebtCeiling);

        return true;
    }

    /**
     * @notice Updates the state of the permission accessed by the yToken before a new collateral deposit.
     *
     * @dev Emits a {SetDepositCollateralAllowed} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator.
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
        return true;
    }

    /**
     * @notice Updates the oracle contract's address saved in storage.
     *
     * @dev Emits a {SetOracle} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator.
     * - The new address cannot be the zero address.
     *
     * @param oracle_ The new oracle contract.
     * @return bool true=success, otherwise it reverts.
     */
    function setOracle(UniswapAnchoredViewInterface oracle_) external override onlyAdmin returns (bool) {
        require(address(oracle_) != address(0x00), "ERR_SET_ORACLE_ZERO_ADDRESS");
        address oldOracle = address(oracle);
        oracle = oracle_;
        emit SetOracle(admin, oldOracle, address(oracle));
        return true;
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
        return true;
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
        return true;
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
        return true;
    }
}
