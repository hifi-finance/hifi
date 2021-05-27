/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/Admin.sol";

import "./IFintroller.sol";
import "./IFyToken.sol";
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

    /// @dev Maps the fyToken address to the Bond structs.
    mapping(IFyToken => Bond) internal bonds;

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
    function getBond(IFyToken fyToken) external view override returns (Bond memory) {
        return bonds[fyToken];
    }

    /// @inheritdoc IFintroller
    function getBondCollateralizationRatio(IFyToken fyToken) external view override returns (uint256) {
        return bonds[fyToken].collateralizationRatio;
    }

    /// @inheritdoc IFintroller
    function getBondDebtCeiling(IFyToken fyToken) external view override returns (uint256) {
        return bonds[fyToken].debtCeiling;
    }

    /// @inheritdoc IFintroller
    function getBondLiquidationIncentive(IFyToken fyToken) external view override returns (uint256) {
        return bonds[fyToken].liquidationIncentive;
    }

    /// @inheritdoc IFintroller
    function getBorrowAllowed(IFyToken fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "BOND_NOT_LISTED");
        return bond.isBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getDepositCollateralAllowed(IFyToken fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "BOND_NOT_LISTED");
        return bond.isDepositCollateralAllowed;
    }

    /// @inheritdoc IFintroller
    function getLiquidateBorrowAllowed(IFyToken fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "BOND_NOT_LISTED");
        return bond.isLiquidateBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getRedeemFyTokensAllowed(IFyToken fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "BOND_NOT_LISTED");
        return bond.isRedeemFyTokenAllowed;
    }

    /// @inheritdoc IFintroller
    function getRepayBorrowAllowed(IFyToken fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "BOND_NOT_LISTED");
        return bond.isRepayBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getSupplyUnderlyingAllowed(IFyToken fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "BOND_NOT_LISTED");
        return bond.isSupplyUnderlyingAllowed;
    }

    /// @inheritdoc IFintroller
    function isBondListed(IFyToken fyToken) external view override returns (bool) {
        return bonds[fyToken].isListed;
    }

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IFintroller
    function listBond(IFyToken fyToken) external override onlyAdmin {
        require(fyToken.isFyToken(), "LIST_BOND_FYTOKEN_INSPECTION");
        bonds[fyToken] = Bond({
            collateralizationRatio: defaultCollateralizationRatio,
            debtCeiling: 0,
            isBorrowAllowed: true,
            isDepositCollateralAllowed: true,
            isLiquidateBorrowAllowed: true,
            isListed: true,
            isRedeemFyTokenAllowed: true,
            isRepayBorrowAllowed: true,
            isSupplyUnderlyingAllowed: true,
            liquidationIncentive: defaultLiquidationIncentive
        });
        emit ListBond(admin, fyToken);
    }

    /// @inheritdoc IFintroller
    function setBondCollateralizationRatio(IFyToken fyToken, uint256 newCollateralizationRatio)
        external
        override
        onlyAdmin
    {
        // Checks: bond is listed.
        require(bonds[fyToken].isListed, "BOND_NOT_LISTED");

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
        uint256 oldCollateralizationRatio = bonds[fyToken].collateralizationRatio;
        bonds[fyToken].collateralizationRatio = newCollateralizationRatio;

        emit SetBondCollateralizationRatio(admin, fyToken, oldCollateralizationRatio, newCollateralizationRatio);
    }

    /// @inheritdoc IFintroller
    function setBondDebtCeiling(IFyToken fyToken, uint256 newDebtCeiling) external override onlyAdmin {
        // Checks: bond is listed.
        require(bonds[fyToken].isListed, "BOND_NOT_LISTED");

        // Checks: the zero edge case.
        require(newDebtCeiling > 0, "SET_BOND_DEBT_CEILING_ZERO");

        // Checks: above total supply of fyTokens.
        uint256 totalSupply = fyToken.totalSupply();
        require(newDebtCeiling >= totalSupply, "SET_BOND_DEBT_CEILING_UNDERFLOW");

        // Effects: update storage.
        uint256 oldDebtCeiling = bonds[fyToken].debtCeiling;
        bonds[fyToken].debtCeiling = newDebtCeiling;

        emit SetBondDebtCeiling(admin, fyToken, oldDebtCeiling, newDebtCeiling);
    }

    /// @inheritdoc IFintroller
    function setBondLiquidationIncentive(IFyToken fyToken, uint256 newLiquidationIncentive)
        external
        override
        onlyAdmin
    {
        // Checks: bond is listed.
        require(bonds[fyToken].isListed, "BOND_NOT_LISTED");

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
        uint256 oldLiquidationIncentive = bonds[fyToken].liquidationIncentive;
        bonds[fyToken].liquidationIncentive = newLiquidationIncentive;

        emit SetBondLiquidationIncentive(admin, fyToken, oldLiquidationIncentive, newLiquidationIncentive);
    }

    /// @inheritdoc IFintroller
    function setBorrowAllowed(IFyToken fyToken, bool state) external override onlyAdmin {
        require(bonds[fyToken].isListed, "BOND_NOT_LISTED");
        bonds[fyToken].isBorrowAllowed = state;
        emit SetBorrowAllowed(admin, fyToken, state);
    }

    /// @inheritdoc IFintroller
    function setDepositCollateralAllowed(IFyToken fyToken, bool state) external override onlyAdmin {
        require(bonds[fyToken].isListed, "BOND_NOT_LISTED");
        bonds[fyToken].isDepositCollateralAllowed = state;
        emit SetDepositCollateralAllowed(admin, fyToken, state);
    }

    /// @inheritdoc IFintroller
    function setLiquidateBorrowAllowed(IFyToken fyToken, bool state) external override onlyAdmin {
        require(bonds[fyToken].isListed, "BOND_NOT_LISTED");
        bonds[fyToken].isLiquidateBorrowAllowed = state;
        emit SetLiquidateBorrowAllowed(admin, fyToken, state);
    }

    /// @inheritdoc IFintroller
    function setOracle(IChainlinkOperator newOracle) external override onlyAdmin {
        require(address(newOracle) != address(0x00), "SET_ORACLE_ZERO_ADDRESS");
        address oldOracle = address(oracle);
        oracle = newOracle;
        emit SetOracle(admin, oldOracle, address(newOracle));
    }

    /// @inheritdoc IFintroller
    function setRedeemFyTokensAllowed(IFyToken fyToken, bool state) external override onlyAdmin {
        require(bonds[fyToken].isListed, "BOND_NOT_LISTED");
        bonds[fyToken].isRedeemFyTokenAllowed = state;
        emit SetRedeemFyTokensAllowed(admin, fyToken, state);
    }

    /// @inheritdoc IFintroller
    function setRepayBorrowAllowed(IFyToken fyToken, bool state) external override onlyAdmin {
        require(bonds[fyToken].isListed, "BOND_NOT_LISTED");
        bonds[fyToken].isRepayBorrowAllowed = state;
        emit SetRepayBorrowAllowed(admin, fyToken, state);
    }

    /// @inheritdoc IFintroller
    function setSupplyUnderlyingAllowed(IFyToken fyToken, bool state) external override onlyAdmin {
        require(bonds[fyToken].isListed, "BOND_NOT_LISTED");
        bonds[fyToken].isSupplyUnderlyingAllowed = state;
        emit SetSupplyUnderlyingAllowed(admin, fyToken, state);
    }
}
