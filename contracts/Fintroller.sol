/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/Admin.sol";

import "./IFintroller.sol";
import "./IHToken.sol";
import "./oracles/ChainlinkOperator.sol";

/// @notice Fintroller
/// @author Hifi
/// @notice Controls the financial permissions and risk parameters for the Hifi protocol.
contract Fintroller is
    Admin, /// one dependency
    IFintroller /// one dependency
{
    /// STORAGE PROPERTIES ///

    /// @inheritdoc IFintroller
    bool public constant override isFintroller = true;

    /// @inheritdoc IFintroller
    IChainlinkOperator public override oracle;

    /// @dev Maps the hToken address to the Bond structs.
    mapping(IHToken => Bond) internal bonds;

    /// @dev The threshold below which the collateralization ratio cannot be set, equivalent to 100%.
    uint256 internal constant collateralizationRatioLowerBound = 1.0e18;

    /// @dev The threshold above which the collateralization ratio cannot be set, equivalent to 10,000%.
    uint256 internal constant collateralizationRatioUpperBound = 1.0e20;

    /// @dev The default collateralization ratio set when a new bond is listed, equivalent to 150%.
    uint256 internal constant defaultCollateralizationRatio = 1.5e18;

    /// @dev The default liquidation incentive set when a new bond is listed, equivalent to 110%.
    uint256 internal constant defaultLiquidationIncentive = 1.1e18;

    /// @dev The threshold below which the liquidation incentive cannot be set, equivalent to 100%.
    uint256 internal constant liquidationIncentiveLowerBound = 1.0e18;

    /// @dev The threshold above which the liquidation incentive cannot be set, equivalent to 150%.
    uint256 internal constant liquidationIncentiveUpperBound = 1.5e18;

    /// CONSTANT FUNCTIONS ///

    /// @inheritdoc IFintroller
    function getBond(IHToken hToken) external view override returns (Bond memory) {
        return bonds[hToken];
    }

    /// @inheritdoc IFintroller
    function getBondCollateralizationRatio(IHToken hToken) external view override returns (uint256) {
        return bonds[hToken].collateralizationRatio;
    }

    /// @inheritdoc IFintroller
    function getBondDebtCeiling(IHToken hToken) external view override returns (uint256) {
        return bonds[hToken].debtCeiling;
    }

    /// @inheritdoc IFintroller
    function getBondLiquidationIncentive(IHToken hToken) external view override returns (uint256) {
        return bonds[hToken].liquidationIncentive;
    }

    /// @inheritdoc IFintroller
    function getBorrowAllowed(IHToken hToken) external view override returns (bool) {
        Bond memory bond = bonds[hToken];
        require(bond.isListed, "BOND_NOT_LISTED");
        return bond.isBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getDepositCollateralAllowed(IHToken hToken) external view override returns (bool) {
        Bond memory bond = bonds[hToken];
        require(bond.isListed, "BOND_NOT_LISTED");
        return bond.isDepositCollateralAllowed;
    }

    /// @inheritdoc IFintroller
    function getLiquidateBorrowAllowed(IHToken hToken) external view override returns (bool) {
        Bond memory bond = bonds[hToken];
        require(bond.isListed, "BOND_NOT_LISTED");
        return bond.isLiquidateBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getRedeemHTokensAllowed(IHToken hToken) external view override returns (bool) {
        Bond memory bond = bonds[hToken];
        require(bond.isListed, "BOND_NOT_LISTED");
        return bond.isRedeemHTokenAllowed;
    }

    /// @inheritdoc IFintroller
    function getRepayBorrowAllowed(IHToken hToken) external view override returns (bool) {
        Bond memory bond = bonds[hToken];
        require(bond.isListed, "BOND_NOT_LISTED");
        return bond.isRepayBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getSupplyUnderlyingAllowed(IHToken hToken) external view override returns (bool) {
        Bond memory bond = bonds[hToken];
        require(bond.isListed, "BOND_NOT_LISTED");
        return bond.isSupplyUnderlyingAllowed;
    }

    /// @inheritdoc IFintroller
    function isBondListed(IHToken hToken) external view override returns (bool) {
        return bonds[hToken].isListed;
    }

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IFintroller
    function listBond(IHToken hToken) external override onlyAdmin {
        require(hToken.isHToken(), "LIST_BOND_HTOKEN_INSPECTION");
        bonds[hToken] = Bond({
            collateralizationRatio: defaultCollateralizationRatio,
            debtCeiling: 0,
            isBorrowAllowed: true,
            isDepositCollateralAllowed: true,
            isLiquidateBorrowAllowed: true,
            isListed: true,
            isRedeemHTokenAllowed: true,
            isRepayBorrowAllowed: true,
            isSupplyUnderlyingAllowed: true,
            liquidationIncentive: defaultLiquidationIncentive
        });
        emit ListBond(admin, hToken);
    }

    /// @inheritdoc IFintroller
    function setBondCollateralizationRatio(IHToken hToken, uint256 newCollateralizationRatio)
        external
        override
        onlyAdmin
    {
        // Checks: bond is listed.
        require(bonds[hToken].isListed, "BOND_NOT_LISTED");

        // Checks: new collateralization ratio is within the accepted bounds.
        require(
            newCollateralizationRatio <= collateralizationRatioUpperBound,
            "SET_BOND_COLLATERALIZATION_RATIO_UPPER_BOUND"
        );
        require(
            newCollateralizationRatio >= collateralizationRatioLowerBound,
            "SET_BOND_COLLATERALIZATION_RATIO_LOWER_BOUND"
        );

        // Effects: update storage.
        uint256 oldCollateralizationRatio = bonds[hToken].collateralizationRatio;
        bonds[hToken].collateralizationRatio = newCollateralizationRatio;

        emit SetBondCollateralizationRatio(admin, hToken, oldCollateralizationRatio, newCollateralizationRatio);
    }

    /// @inheritdoc IFintroller
    function setBondDebtCeiling(IHToken hToken, uint256 newDebtCeiling) external override onlyAdmin {
        // Checks: bond is listed.
        require(bonds[hToken].isListed, "BOND_NOT_LISTED");

        // Checks: the zero edge case.
        require(newDebtCeiling > 0, "SET_BOND_DEBT_CEILING_ZERO");

        // Checks: above total supply of hTokens.
        uint256 totalSupply = hToken.totalSupply();
        require(newDebtCeiling >= totalSupply, "SET_BOND_DEBT_CEILING_UNDERFLOW");

        // Effects: update storage.
        uint256 oldDebtCeiling = bonds[hToken].debtCeiling;
        bonds[hToken].debtCeiling = newDebtCeiling;

        emit SetBondDebtCeiling(admin, hToken, oldDebtCeiling, newDebtCeiling);
    }

    /// @inheritdoc IFintroller
    function setBondLiquidationIncentive(IHToken hToken, uint256 newLiquidationIncentive) external override onlyAdmin {
        // Checks: bond is listed.
        require(bonds[hToken].isListed, "BOND_NOT_LISTED");

        // Checks: new collateralization ratio is within the accepted bounds.
        require(
            newLiquidationIncentive <= liquidationIncentiveUpperBound,
            "SET_BOND_LIQUIDATION_INCENTIVE_UPPER_BOUND"
        );
        require(
            newLiquidationIncentive >= liquidationIncentiveLowerBound,
            "SET_BOND_LIQUIDATION_INCENTIVE_LOWER_BOUND"
        );

        // Effects: update storage.
        uint256 oldLiquidationIncentive = bonds[hToken].liquidationIncentive;
        bonds[hToken].liquidationIncentive = newLiquidationIncentive;

        emit SetBondLiquidationIncentive(admin, hToken, oldLiquidationIncentive, newLiquidationIncentive);
    }

    /// @inheritdoc IFintroller
    function setBorrowAllowed(IHToken hToken, bool state) external override onlyAdmin {
        require(bonds[hToken].isListed, "BOND_NOT_LISTED");
        bonds[hToken].isBorrowAllowed = state;
        emit SetBorrowAllowed(admin, hToken, state);
    }

    /// @inheritdoc IFintroller
    function setDepositCollateralAllowed(IHToken hToken, bool state) external override onlyAdmin {
        require(bonds[hToken].isListed, "BOND_NOT_LISTED");
        bonds[hToken].isDepositCollateralAllowed = state;
        emit SetDepositCollateralAllowed(admin, hToken, state);
    }

    /// @inheritdoc IFintroller
    function setLiquidateBorrowAllowed(IHToken hToken, bool state) external override onlyAdmin {
        require(bonds[hToken].isListed, "BOND_NOT_LISTED");
        bonds[hToken].isLiquidateBorrowAllowed = state;
        emit SetLiquidateBorrowAllowed(admin, hToken, state);
    }

    /// @inheritdoc IFintroller
    function setOracle(IChainlinkOperator newOracle) external override onlyAdmin {
        require(address(newOracle) != address(0x00), "SET_ORACLE_ZERO_ADDRESS");
        address oldOracle = address(oracle);
        oracle = newOracle;
        emit SetOracle(admin, oldOracle, address(newOracle));
    }

    /// @inheritdoc IFintroller
    function setRedeemHTokensAllowed(IHToken hToken, bool state) external override onlyAdmin {
        require(bonds[hToken].isListed, "BOND_NOT_LISTED");
        bonds[hToken].isRedeemHTokenAllowed = state;
        emit SetRedeemHTokensAllowed(admin, hToken, state);
    }

    /// @inheritdoc IFintroller
    function setRepayBorrowAllowed(IHToken hToken, bool state) external override onlyAdmin {
        require(bonds[hToken].isListed, "BOND_NOT_LISTED");
        bonds[hToken].isRepayBorrowAllowed = state;
        emit SetRepayBorrowAllowed(admin, hToken, state);
    }

    /// @inheritdoc IFintroller
    function setSupplyUnderlyingAllowed(IHToken hToken, bool state) external override onlyAdmin {
        require(bonds[hToken].isListed, "BOND_NOT_LISTED");
        bonds[hToken].isSupplyUnderlyingAllowed = state;
        emit SetSupplyUnderlyingAllowed(admin, hToken, state);
    }
}
