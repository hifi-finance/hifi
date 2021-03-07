/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/math/Exponential.sol";

import "./FintrollerInterface.sol";
import "./FyTokenInterface.sol";
import "./oracles/ChainlinkOperatorInterface.sol";

/// @notice Fintroller
/// @author Hifi
/// @notice Controls the financial permissions and risk parameters for the Hifi protocol.
contract Fintroller is
    FintrollerInterface, /// one dependency
    Admin /// two dependencies
{
    /// CONSTANT FUNCTIONS ///

    /// @inheritdoc FintrollerInterface
    function getBond(FyTokenInterface fyToken) external view override returns (Bond memory) {
        return bonds[fyToken];
    }

    /// @inheritdoc FintrollerInterface
    function getBondCollateralizationRatio(FyTokenInterface fyToken) external view override returns (uint256) {
        return bonds[fyToken].collateralizationRatio.mantissa;
    }

    /// @inheritdoc FintrollerInterface
    function getBondDebtCeiling(FyTokenInterface fyToken) external view override returns (uint256) {
        return bonds[fyToken].debtCeiling;
    }

    /// @inheritdoc FintrollerInterface
    function getBondLiquidationIncentive(FyTokenInterface fyToken) external view override returns (uint256) {
        return bonds[fyToken].liquidationIncentive;
    }

    /// @inheritdoc FintrollerInterface
    function getBorrowAllowed(FyTokenInterface fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isBorrowAllowed;
    }

    /// @inheritdoc FintrollerInterface
    function getDepositCollateralAllowed(FyTokenInterface fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isDepositCollateralAllowed;
    }

    /// @inheritdoc FintrollerInterface
    function getLiquidateBorrowAllowed(FyTokenInterface fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isLiquidateBorrowAllowed;
    }

    /// @inheritdoc FintrollerInterface
    function getRedeemFyTokensAllowed(FyTokenInterface fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isRedeemFyTokenAllowed;
    }

    /// @inheritdoc FintrollerInterface
    function getRepayBorrowAllowed(FyTokenInterface fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isRepayBorrowAllowed;
    }

    /// @inheritdoc FintrollerInterface
    function getSupplyUnderlyingAllowed(FyTokenInterface fyToken) external view override returns (bool) {
        Bond memory bond = bonds[fyToken];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isSupplyUnderlyingAllowed;
    }

    /// @inheritdoc FintrollerInterface
    function isBondListed(FyTokenInterface fyToken) external view override returns (bool) {
        return bonds[fyToken].isListed;
    }

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc FintrollerInterface
    function listBond(FyTokenInterface fyToken) external override onlyAdmin returns (bool) {
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

    /// @inheritdoc FintrollerInterface
    function setBondCollateralizationRatio(FyTokenInterface fyToken, uint256 newCollateralizationRatioMantissa)
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

    /// @inheritdoc FintrollerInterface
    function setBondDebtCeiling(FyTokenInterface fyToken, uint256 newDebtCeiling)
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

    /// @inheritdoc FintrollerInterface
    function setBondLiquidationIncentive(FyTokenInterface fyToken, uint256 newLiquidationIncentive)
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

    /// @inheritdoc FintrollerInterface
    function setBorrowAllowed(FyTokenInterface fyToken, bool state) external override onlyAdmin returns (bool) {
        require(bonds[fyToken].isListed, "ERR_BOND_NOT_LISTED");
        bonds[fyToken].isBorrowAllowed = state;
        emit SetBorrowAllowed(admin, fyToken, state);
        return true;
    }

    /// @inheritdoc FintrollerInterface
    function setDepositCollateralAllowed(FyTokenInterface fyToken, bool state)
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

    /// @inheritdoc FintrollerInterface
    function setLiquidateBorrowAllowed(FyTokenInterface fyToken, bool state)
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

    /// @inheritdoc FintrollerInterface
    function setOracle(ChainlinkOperatorInterface newOracle) external override onlyAdmin returns (bool) {
        require(address(newOracle) != address(0x00), "ERR_SET_ORACLE_ZERO_ADDRESS");
        address oldOracle = address(oracle);
        oracle = newOracle;
        emit SetOracle(admin, oldOracle, address(newOracle));
        return true;
    }

    /// @inheritdoc FintrollerInterface
    function setRedeemFyTokensAllowed(FyTokenInterface fyToken, bool state) external override onlyAdmin returns (bool) {
        require(bonds[fyToken].isListed, "ERR_BOND_NOT_LISTED");
        bonds[fyToken].isRedeemFyTokenAllowed = state;
        emit SetRedeemFyTokensAllowed(admin, fyToken, state);
        return true;
    }

    /// @inheritdoc FintrollerInterface
    function setRepayBorrowAllowed(FyTokenInterface fyToken, bool state) external override onlyAdmin returns (bool) {
        require(bonds[fyToken].isListed, "ERR_BOND_NOT_LISTED");
        bonds[fyToken].isRepayBorrowAllowed = state;
        emit SetRepayBorrowAllowed(admin, fyToken, state);
        return true;
    }

    /// @inheritdoc FintrollerInterface
    function setSupplyUnderlyingAllowed(FyTokenInterface fyToken, bool state)
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
