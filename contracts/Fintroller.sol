/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/token/erc20/IErc20.sol";

import "./IFintroller.sol";
import "./IHToken.sol";

/// @notice Fintroller
/// @author Hifi
contract Fintroller is
    Admin, /// one dependency
    IFintroller /// one dependency
{
    /// STORAGE ///

    /// @inheritdoc IFintroller
    uint256 public override maxBonds;

    /// @dev The threshold below which the collateralization ratio cannot be set, equivalent to 100%.
    uint256 internal constant COLLATERALIZATION_RATIO_LOWER_BOUND = 1.0e18;

    /// @dev The threshold above which the collateralization ratio cannot be set, equivalent to 10,000%.
    uint256 internal constant COLLATERALIZATION_RATIO_UPPER_BOUND = 1.0e20;

    /// @dev The default collateralization ratio set when a new bond is listed, equivalent to 150%.
    uint256 internal constant DEFAULT_COLLATERALIZATION_RATIO = 1.5e18;

    /// @dev The default liquidation incentive set when a new bond is listed, equivalent to 110%.
    uint256 internal constant DEFAULT_LIQUIDATION_INCENTIVE = 1.1e18;

    /// @dev The threshold below which the liquidation incentive cannot be set, equivalent to 100%.
    uint256 internal constant LIQUIDATION_INCENTIVE_LOWER_BOUND = 1.0e18;

    /// @dev The threshold above which the liquidation incentive cannot be set, equivalent to 150%.
    uint256 internal constant LIQUIDATION_INCENTIVE_UPPER_BOUND = 1.5e18;

    /// @notice Maps hTokens to Bond structs.
    mapping(IHToken => Bond) internal bonds;

    /// @notice Maps IErc20s to Collateral structs.
    mapping(IErc20 => Collateral) internal collaterals;

    /// PUBLIC CONSTANT FUNCTIONS ///

    /// @inheritdoc IFintroller
    function getBond(IHToken hToken) external view override returns (Bond memory) {
        return bonds[hToken];
    }

    /// @inheritdoc IFintroller
    function getBorrowAllowed(IHToken bond) external view override returns (bool) {
        require(bonds[bond].isListed, "BOND_NOT_LISTED");
        return bonds[bond].isBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getCollateral(IErc20 collateral) external view override returns (Collateral memory) {
        return collaterals[collateral];
    }

    /// @inheritdoc IFintroller
    function getCollateralizationRatio(IErc20 collateral) external view override returns (uint256) {
        return collaterals[collateral].collateralizationRatio;
    }

    /// @inheritdoc IFintroller
    function getDebtCeiling(IHToken bond) external view override returns (uint256) {
        return bonds[bond].debtCeiling;
    }

    /// @inheritdoc IFintroller
    function getDepositCollateralAllowed(IErc20 collateral) external view override returns (bool) {
        require(collaterals[collateral].isListed, "COLLATERAL_NOT_LISTED");
        return collaterals[collateral].isDepositCollateralAllowed;
    }

    /// @inheritdoc IFintroller
    function getLiquidationIncentive(IErc20 collateral) external view override returns (uint256) {
        return collaterals[collateral].liquidationIncentive;
    }

    /// @inheritdoc IFintroller
    function getLiquidateBorrowAllowed(IHToken bond) external view override returns (bool) {
        require(bonds[bond].isListed, "BOND_NOT_LISTED");
        return bonds[bond].isLiquidateBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getRepayBorrowAllowed(IHToken bond) external view override returns (bool) {
        require(bonds[bond].isListed, "BOND_NOT_LISTED");
        return bonds[bond].isRepayBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function isBondListed(IHToken bond) external view override returns (bool) {
        return bonds[bond].isListed;
    }

    /// @notice Checks if the collateral is listed.
    /// @param collateral The collateral to make the check against.
    /// @return bool true = listed, otherwise not.
    function isCollateralListed(IErc20 collateral) external view override returns (bool) {
        return collaterals[collateral].isListed;
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IFintroller
    function listBond(IHToken bond) external override onlyAdmin {
        bonds[bond] = Bond({
            debtCeiling: 0,
            isBorrowAllowed: true,
            isLiquidateBorrowAllowed: true,
            isListed: true,
            isRedeemHTokenAllowed: true,
            isRepayBorrowAllowed: true,
            isSupplyUnderlyingAllowed: true
        });
        emit ListBond(admin, bond);
    }

    /// @inheritdoc IFintroller
    function listCollateral(IErc20 collateral) external override onlyAdmin {
        // Checks: decimals are between the expected bounds.
        uint256 decimals = collateral.decimals();
        require(decimals > 0, "LIST_COLLATERAL_DECIMALS_ZERO");
        require(decimals < 19, "LIST_COLLATERAL_DECIMALS_OVERFLOW");

        // Effects: update storage.
        collaterals[collateral] = Collateral({
            collateralizationRatio: DEFAULT_COLLATERALIZATION_RATIO,
            isDepositCollateralAllowed: true,
            isListed: true,
            liquidationIncentive: DEFAULT_LIQUIDATION_INCENTIVE
        });

        emit ListCollateral(admin, collateral);
    }

    /// @inheritdoc IFintroller
    function setBorrowAllowed(IHToken bond, bool state) external override onlyAdmin {
        require(bonds[bond].isListed, "BOND_NOT_LISTED");
        bonds[bond].isBorrowAllowed = state;
        emit SetBorrowAllowed(admin, bond, state);
    }

    /// @inheritdoc IFintroller
    function setCollateralizationRatio(IErc20 collateral, uint256 newCollateralizationRatio)
        external
        override
        onlyAdmin
    {
        // Checks: bond is listed.
        require(collaterals[collateral].isListed, "COLLATERAL_NOT_LISTED");

        // Checks: new collateralization ratio is within the accepted bounds.
        require(
            newCollateralizationRatio <= COLLATERALIZATION_RATIO_UPPER_BOUND,
            "SET_COLLATERALIZATION_RATIO_UPPER_BOUND"
        );
        require(
            newCollateralizationRatio >= COLLATERALIZATION_RATIO_LOWER_BOUND,
            "SET_COLLATERALIZATION_RATIO_LOWER_BOUND"
        );

        // Effects: update storage.
        uint256 oldCollateralizationRatio = collaterals[collateral].collateralizationRatio;
        collaterals[collateral].collateralizationRatio = newCollateralizationRatio;

        emit SetCollateralizationRatio(admin, collateral, oldCollateralizationRatio, newCollateralizationRatio);
    }

    /// @inheritdoc IFintroller
    function setDebtCeiling(IHToken bond, uint256 newDebtCeiling) external override onlyAdmin {
        // Checks: bond is listed.
        require(bonds[bond].isListed, "BOND_NOT_LISTED");

        // Checks: the zero edge case.
        require(newDebtCeiling > 0, "SET_DEBT_CEILING_ZERO");

        // Checks: above total supply of hTokens.
        uint256 totalSupply = bond.totalSupply();
        require(newDebtCeiling >= totalSupply, "SET_DEBT_CEILING_UNDERFLOW");

        // Effects: update storage.
        uint256 oldDebtCeiling = bonds[bond].debtCeiling;
        bonds[bond].debtCeiling = newDebtCeiling;

        emit SetDebtCeiling(admin, bond, oldDebtCeiling, newDebtCeiling);
    }

    /// @inheritdoc IFintroller
    function setDepositCollateralAllowed(IErc20 collateral, bool state) external override onlyAdmin {
        require(collaterals[collateral].isListed, "COLLATERAL_NOT_LISTED");
        collaterals[collateral].isDepositCollateralAllowed = state;
        emit SetDepositCollateralAllowed(admin, collateral, state);
    }

    /// @inheritdoc IFintroller
    function setLiquidateBorrowAllowed(IHToken bond, bool state) external override onlyAdmin {
        require(bonds[bond].isListed, "BOND_NOT_LISTED");
        bonds[bond].isLiquidateBorrowAllowed = state;
        emit SetLiquidateBorrowAllowed(admin, bond, state);
    }

    /// @inheritdoc IFintroller
    function setLiquidationIncentive(IErc20 collateral, uint256 newLiquidationIncentive) external override onlyAdmin {
        // Checks: bond is listed.
        require(collaterals[collateral].isListed, "COLLATERAL_NOT_LISTED");

        // Checks: new collateralization ratio is within the accepted bounds.
        require(newLiquidationIncentive <= LIQUIDATION_INCENTIVE_UPPER_BOUND, "SET_LIQUIDATION_INCENTIVE_UPPER_BOUND");
        require(newLiquidationIncentive >= LIQUIDATION_INCENTIVE_LOWER_BOUND, "SET_LIQUIDATION_INCENTIVE_LOWER_BOUND");

        // Effects: update storage.
        uint256 oldLiquidationIncentive = collaterals[collateral].liquidationIncentive;
        collaterals[collateral].liquidationIncentive = newLiquidationIncentive;

        emit SetLiquidationIncentive(admin, collateral, oldLiquidationIncentive, newLiquidationIncentive);
    }

    /// @inheritdoc IFintroller
    function setMaxBonds(uint256 newMaxBonds) external override onlyAdmin {
        uint256 oldMaxBonds = maxBonds;
        maxBonds = newMaxBonds;
        emit SetMaxBonds(admin, oldMaxBonds, newMaxBonds);
    }

    /// @inheritdoc IFintroller
    function setRepayBorrowAllowed(IHToken bond, bool state) external override onlyAdmin {
        require(bonds[bond].isListed, "BOND_NOT_LISTED");
        bonds[bond].isRepayBorrowAllowed = state;
        emit SetRepayBorrowAllowed(admin, bond, state);
    }
}
