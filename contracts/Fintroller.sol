/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/Admin.sol";
import "./Exponential.sol";

import "./interfaces/IFintroller.sol";
import "./interfaces/IFyToken.sol";
import "./interfaces/IChainlinkOperator.sol";

/// @notice Fintroller
/// @author Hifi
/// @notice Controls the financial permissions and risk parameters for the Hifi protocol.
contract Fintroller is
    IFintroller, /// one dependency
    Admin /// two dependencies
{
    /// @dev Maps the fyToken address to the Bond structs.
    mapping(IFyToken => Bond) internal bonds;

    /// @notice The contract that provides price data for the collateral and the underlying asset.
    IChainlinkOperator override public oracle;

    /// @dev The threshold below which the collateralization ratio cannot be set, equivalent to 100%.
    uint256 internal constant collateralizationRatioLowerBoundMantissa = 1.0e18;

    /// @dev The threshold above which the collateralization ratio cannot be set, equivalent to 10,000%.
    uint256 internal constant collateralizationRatioUpperBoundMantissa = 1.0e20;

    /// @dev The dafault collateralization ratio set when a new bond is listed, equivalent to 150%.
    uint256 internal constant defaultCollateralizationRatioMantissa = 1.5e18;

    /// @dev The dafault liquidation incentive mantissa set when a new bond is listed, equivalent to 110%.
    uint256 internal constant defaultLiquidationIncentiveMantissa = 1.1e18;

    /// @dev The threshold below which the liquidation incentive cannot be set, equivalent to 100%.
    uint256 internal constant liquidationIncentiveLowerBoundMantissa = 1.0e18;

    /// @dev The threshold above which the liquidation incentive cannot be set, equivalent to 150%.
    uint256 internal constant liquidationIncentiveUpperBoundMantissa = 1.5e18;

    /// @notice Indicator that this is a Fintroller contract, for inspection.
    bool public override constant isFintroller = true;


    /// CONSTANT FUNCTIONS ///

    /// @inheritdoc IFintroller
    function getBond(IFyToken fyToken) external view override returns (Bond memory) {
        return bonds[fyToken];
    }

    /// @inheritdoc IFintroller
    function getBondCollateralizationRatio(IFyToken fyToken) external view override returns (uint256) {
        return bonds[fyToken].collateralizationRatio.mantissa;
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
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getDepositCollateralAllowed(IFyToken fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isDepositCollateralAllowed;
    }

    /// @inheritdoc IFintroller
    function getLiquidateBorrowAllowed(IFyToken fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isLiquidateBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getRedeemFyTokensAllowed(IFyToken fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isRedeemFyTokenAllowed;
    }

    /// @inheritdoc IFintroller
    function getRepayBorrowAllowed(IFyToken fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isRepayBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getSupplyUnderlyingAllowed(IFyToken fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isSupplyUnderlyingAllowed;
    }

    /// @inheritdoc IFintroller
    function isBondListed(IFyToken fyToken) external view override returns (bool) {
        return bonds[fyToken].isListed;
    }

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IFintroller
    function listBond(IFyToken fyToken) external override onlyAdmin returns (bool) {
        require(fyToken.isFyToken(), "ERR_LIST_BOND_FYTOKEN_INSPECTION");
        bonds[fyToken] = Bond({
            collateralizationRatio: Exp({ mantissa: defaultCollateralizationRatioMantissa }),
            debtCeiling: 0,
            isBorrowAllowed: true,
            isDepositCollateralAllowed: true,
            isLiquidateBorrowAllowed: true,
            isListed: true,
            isRedeemFyTokenAllowed: true,
            isRepayBorrowAllowed: true,
            isSupplyUnderlyingAllowed: true,
            liquidationIncentive: defaultLiquidationIncentiveMantissa
        });
        emit ListBond(admin, fyToken);
        return true;
    }

    /// @inheritdoc IFintroller
    function setBondCollateralizationRatio(IFyToken fyToken, uint256 newCollateralizationRatioMantissa)
        external
        override
        onlyAdmin
        returns (bool)
    {
        // Checks: bond is listed.
        require(bonds[fyToken].isListed, "ERR_BOND_NOT_LISTED");

        // Checks: new collateralization ratio is within the accepted bounds.
        require(
            newCollateralizationRatioMantissa <= collateralizationRatioUpperBoundMantissa,
            "ERR_SET_BOND_COLLATERALIZATION_RATIO_UPPER_BOUND"
        );
        require(
            newCollateralizationRatioMantissa >= collateralizationRatioLowerBoundMantissa,
            "ERR_SET_BOND_COLLATERALIZATION_RATIO_LOWER_BOUND"
        );

        // Effects: update storage.
        uint256 oldCollateralizationRatioMantissa = bonds[fyToken].collateralizationRatio.mantissa;
        bonds[fyToken].collateralizationRatio = Exp({ mantissa: newCollateralizationRatioMantissa });

        emit SetBondCollateralizationRatio(
            admin,
            fyToken,
            oldCollateralizationRatioMantissa,
            newCollateralizationRatioMantissa
        );

        return true;
    }

    /// @inheritdoc IFintroller
    function setBondDebtCeiling(IFyToken fyToken, uint256 newDebtCeiling)
        external
        override
        onlyAdmin
        returns (bool)
    {
        // Checks: bond is listed.
        require(bonds[fyToken].isListed, "ERR_BOND_NOT_LISTED");

        // Checks: the zero edge case.
        require(newDebtCeiling > 0, "ERR_SET_BOND_DEBT_CEILING_ZERO");

        // Checks: above total supply of fyTokens.
        uint256 totalSupply = fyToken.totalSupply();
        require(newDebtCeiling >= totalSupply, "ERR_SET_BOND_DEBT_CEILING_UNDERFLOW");

        // Effects: update storage.
        uint256 oldDebtCeiling = bonds[fyToken].debtCeiling;
        bonds[fyToken].debtCeiling = newDebtCeiling;

        emit SetBondDebtCeiling(admin, fyToken, oldDebtCeiling, newDebtCeiling);

        return true;
    }

    /// @inheritdoc IFintroller
    function setBondLiquidationIncentive(IFyToken fyToken, uint256 newLiquidationIncentive)
        external
        override
        onlyAdmin
        returns (bool)
    {
        // Checks: bond is listed.
        require(bonds[fyToken].isListed, "ERR_BOND_NOT_LISTED");

        // Checks: new collateralization ratio is within the accepted bounds.
        require(
            newLiquidationIncentive <= liquidationIncentiveUpperBoundMantissa,
            "ERR_SET_BOND_LIQUIDATION_INCENTIVE_UPPER_BOUND"
        );
        require(
            newLiquidationIncentive >= liquidationIncentiveLowerBoundMantissa,
            "ERR_SET_BOND_LIQUIDATION_INCENTIVE_LOWER_BOUND"
        );

        // Effects: update storage.
        uint256 oldLiquidationIncentive = bonds[fyToken].liquidationIncentive;
        bonds[fyToken].liquidationIncentive = newLiquidationIncentive;

        emit SetBondLiquidationIncentive(admin, fyToken, oldLiquidationIncentive, newLiquidationIncentive);

        return true;
    }

    /// @inheritdoc IFintroller
    function setBorrowAllowed(IFyToken fyToken, bool state) external override onlyAdmin returns (bool) {
        require(bonds[fyToken].isListed, "ERR_BOND_NOT_LISTED");
        bonds[fyToken].isBorrowAllowed = state;
        emit SetBorrowAllowed(admin, fyToken, state);
        return true;
    }

    /// @inheritdoc IFintroller
    function setDepositCollateralAllowed(IFyToken fyToken, bool state)
        external
        override
        onlyAdmin
        returns (bool)
    {
        require(bonds[fyToken].isListed, "ERR_BOND_NOT_LISTED");
        bonds[fyToken].isDepositCollateralAllowed = state;
        emit SetDepositCollateralAllowed(admin, fyToken, state);
        return true;
    }

    /// @inheritdoc IFintroller
    function setLiquidateBorrowAllowed(IFyToken fyToken, bool state)
        external
        override
        onlyAdmin
        returns (bool)
    {
        require(bonds[fyToken].isListed, "ERR_BOND_NOT_LISTED");
        bonds[fyToken].isLiquidateBorrowAllowed = state;
        emit SetLiquidateBorrowAllowed(admin, fyToken, state);
        return true;
    }

    /// @inheritdoc IFintroller
    function setOracle(IChainlinkOperator newOracle) external override onlyAdmin returns (bool) {
        require(address(newOracle) != address(0x00), "ERR_SET_ORACLE_ZERO_ADDRESS");
        address oldOracle = address(oracle);
        oracle = newOracle;
        emit SetOracle(admin, oldOracle, address(newOracle));
        return true;
    }

    /// @inheritdoc IFintroller
    function setRedeemFyTokensAllowed(IFyToken fyToken, bool state) external override onlyAdmin returns (bool) {
        require(bonds[fyToken].isListed, "ERR_BOND_NOT_LISTED");
        bonds[fyToken].isRedeemFyTokenAllowed = state;
        emit SetRedeemFyTokensAllowed(admin, fyToken, state);
        return true;
    }

    /// @inheritdoc IFintroller
    function setRepayBorrowAllowed(IFyToken fyToken, bool state) external override onlyAdmin returns (bool) {
        require(bonds[fyToken].isListed, "ERR_BOND_NOT_LISTED");
        bonds[fyToken].isRepayBorrowAllowed = state;
        emit SetRepayBorrowAllowed(admin, fyToken, state);
        return true;
    }

    /// @inheritdoc IFintroller
    function setSupplyUnderlyingAllowed(IFyToken fyToken, bool state)
        external
        override
        onlyAdmin
        returns (bool)
    {
        require(bonds[fyToken].isListed, "ERR_BOND_NOT_LISTED");
        bonds[fyToken].isSupplyUnderlyingAllowed = state;
        emit SetSupplyUnderlyingAllowed(admin, fyToken, state);
        return true;
    }
}
