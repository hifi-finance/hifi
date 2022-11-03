// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.4;

import "@prb/contracts/access/Ownable.sol";
import "@prb/contracts/token/erc20/IErc20.sol";

import "./IFintroller.sol";
import "../h-token/IHToken.sol";

/// @notice Fintroller
/// @author Hifi
contract Fintroller is
    IFintroller, // one dependency
    Ownable // one dependency
{
    /// PUBLIC STORAGE ///

    /// @inheritdoc IFintroller
    uint256 public override maxBonds;

    /// @inheritdoc IFintroller
    uint256 public override maxCollaterals;

    /// INTERNAL STORAGE ///

    /// @dev The threshold below which the collateral ratio cannot be set, equivalent to 100%.
    uint256 internal constant COLLATERAL_RATIO_LOWER_BOUND = 1.0e18;

    /// @dev The threshold above which the collateral ratio cannot be set, equivalent to 10,000%.
    uint256 internal constant COLLATERAL_RATIO_UPPER_BOUND = 1.0e20;

    /// @dev The default collateral ratio set when a new bond is listed, equivalent to 150%.
    uint256 internal constant DEFAULT_COLLATERAL_RATIO = 1.5e18;

    /// @dev The default liquidation incentive set when a new bond is listed, equivalent to 110%.
    uint256 internal constant DEFAULT_LIQUIDATION_INCENTIVE = 1.1e18;

    /// @dev The default maximum number of bond markets a single account can enter.
    uint256 internal constant DEFAULT_MAX_BONDS = 10;

    /// @dev The default maximum number of collaterals a single account can deposit.
    uint256 internal constant DEFAULT_MAX_COLLATERALS = 10;

    /// @dev The threshold below which the liquidation incentive cannot be set, equivalent to 100%.
    uint256 internal constant LIQUIDATION_INCENTIVE_LOWER_BOUND = 1.0e18;

    /// @dev The threshold above which the liquidation incentive cannot be set, equivalent to 150%.
    uint256 internal constant LIQUIDATION_INCENTIVE_UPPER_BOUND = 1.5e18;

    /// @notice Maps hTokens to Bond structs.
    mapping(IHToken => Bond) internal bonds;

    /// @notice Maps IErc20s to Collateral structs.
    mapping(IErc20 => Collateral) internal collaterals;

    /// CONSTRUCTOR ///

    constructor() Ownable() {
        // Set the max bonds limit.
        maxBonds = DEFAULT_MAX_BONDS;

        // Set the max collaterals limit
        maxCollaterals = DEFAULT_MAX_COLLATERALS;
    }

    /// PUBLIC CONSTANT FUNCTIONS ///

    /// @inheritdoc IFintroller
    function getBond(IHToken hToken) external view override returns (Bond memory) {
        return bonds[hToken];
    }

    /// @inheritdoc IFintroller
    function getBorrowAllowed(IHToken bond) external view override returns (bool) {
        if (!bonds[bond].isListed) {
            revert Fintroller__BondNotListed(bond);
        }
        return bonds[bond].isBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getCollateral(IErc20 collateral) external view override returns (Collateral memory) {
        return collaterals[collateral];
    }

    /// @inheritdoc IFintroller
    function getCollateralCeiling(IErc20 collateral) external view override returns (uint256) {
        return collaterals[collateral].ceiling;
    }

    /// @inheritdoc IFintroller
    function getCollateralRatio(IErc20 collateral) external view override returns (uint256) {
        return collaterals[collateral].ratio;
    }

    /// @inheritdoc IFintroller
    function getDebtCeiling(IHToken bond) external view override returns (uint256) {
        return bonds[bond].debtCeiling;
    }

    /// @inheritdoc IFintroller
    function getDepositCollateralAllowed(IErc20 collateral) external view override returns (bool) {
        if (!collaterals[collateral].isListed) {
            revert Fintroller__CollateralNotListed(collateral);
        }
        return collaterals[collateral].isDepositCollateralAllowed;
    }

    /// @inheritdoc IFintroller
    function getDepositUnderlyingAllowed(IHToken bond) external view override returns (bool) {
        if (!bonds[bond].isListed) {
            revert Fintroller__BondNotListed(bond);
        }
        return bonds[bond].isDepositUnderlyingAllowed;
    }

    /// @inheritdoc IFintroller
    function getLiquidationIncentive(IErc20 collateral) external view override returns (uint256) {
        return collaterals[collateral].liquidationIncentive;
    }

    /// @inheritdoc IFintroller
    function getLiquidateBorrowAllowed(IHToken bond) external view override returns (bool) {
        if (!bonds[bond].isListed) {
            revert Fintroller__BondNotListed(bond);
        }
        return bonds[bond].isLiquidateBorrowAllowed;
    }

    /// @inheritdoc IFintroller
    function getRepayBorrowAllowed(IHToken bond) external view override returns (bool) {
        if (!bonds[bond].isListed) {
            revert Fintroller__BondNotListed(bond);
        }
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
    function listBond(IHToken bond) external override onlyOwner {
        bonds[bond] = Bond({
            debtCeiling: 0,
            isBorrowAllowed: true,
            isDepositUnderlyingAllowed: true,
            isLiquidateBorrowAllowed: true,
            isListed: true,
            isRepayBorrowAllowed: true
        });
        emit ListBond(owner, bond);
    }

    /// @inheritdoc IFintroller
    function listCollateral(IErc20 collateral) external override onlyOwner {
        // Checks: decimals are between the expected bounds.
        uint256 decimals = collateral.decimals();
        if (decimals == 0) {
            revert Fintroller__CollateralDecimalsZero();
        }
        if (decimals > 18) {
            revert Fintroller__CollateralDecimalsOverflow(decimals);
        }

        // Effects: update storage.
        collaterals[collateral] = Collateral({
            ceiling: 0,
            isDepositCollateralAllowed: true,
            isListed: true,
            liquidationIncentive: DEFAULT_LIQUIDATION_INCENTIVE,
            ratio: DEFAULT_COLLATERAL_RATIO
        });

        emit ListCollateral(owner, collateral);
    }

    /// @inheritdoc IFintroller
    function setBorrowAllowed(IHToken bond, bool state) external override onlyOwner {
        if (!bonds[bond].isListed) {
            revert Fintroller__BondNotListed(bond);
        }

        if (state && !bonds[bond].isLiquidateBorrowAllowed) {
            revert Fintroller__BondBorrowAllowedWithLiquidateBorrowDisallowed();
        }

        bonds[bond].isBorrowAllowed = state;
        emit SetBorrowAllowed(owner, bond, state);
    }

    /// @inheritdoc IFintroller
    function setCollateralCeiling(IHToken collateral, uint256 newCollateralCeiling) external override onlyOwner {
        // Checks: collateral is listed.
        if (!collaterals[collateral].isListed) {
            revert Fintroller__CollateralNotListed(collateral);
        }

        // Effects: update storage.
        uint256 oldCollateralCeiling = collaterals[collateral].ceiling;
        collaterals[collateral].ceiling = newCollateralCeiling;

        emit SetCollateralCeiling(owner, collateral, oldCollateralCeiling, newCollateralCeiling);
    }

    /// @inheritdoc IFintroller
    function setCollateralRatio(IErc20 collateral, uint256 newCollateralRatio) external override onlyOwner {
        // Checks: collateral is listed.
        if (!collaterals[collateral].isListed) {
            revert Fintroller__CollateralNotListed(collateral);
        }

        // Checks: new collateral ratio is within the accepted bounds.
        if (newCollateralRatio > COLLATERAL_RATIO_UPPER_BOUND) {
            revert Fintroller__CollateralRatioOverflow(newCollateralRatio);
        }
        if (newCollateralRatio < COLLATERAL_RATIO_LOWER_BOUND) {
            revert Fintroller__CollateralRatioUnderflow(newCollateralRatio);
        }
        if (newCollateralRatio < collaterals[collateral].liquidationIncentive) {
            revert Fintroller__CollateralRatioBelowLiquidationIncentive(newCollateralRatio);
        }

        // Effects: update storage.
        uint256 oldCollateralRatio = collaterals[collateral].ratio;
        collaterals[collateral].ratio = newCollateralRatio;

        emit SetCollateralRatio(owner, collateral, oldCollateralRatio, newCollateralRatio);
    }

    /// @inheritdoc IFintroller
    function setDebtCeiling(IHToken bond, uint256 newDebtCeiling) external override onlyOwner {
        // Checks: bond is listed.
        if (!bonds[bond].isListed) {
            revert Fintroller__BondNotListed(bond);
        }

        // Checks: above total supply of hTokens.
        uint256 totalSupply = bond.totalSupply();
        if (newDebtCeiling < totalSupply) {
            revert Fintroller__DebtCeilingUnderflow(newDebtCeiling, totalSupply);
        }

        // Effects: update storage.
        uint256 oldDebtCeiling = bonds[bond].debtCeiling;
        bonds[bond].debtCeiling = newDebtCeiling;

        emit SetDebtCeiling(owner, bond, oldDebtCeiling, newDebtCeiling);
    }

    /// @inheritdoc IFintroller
    function setDepositCollateralAllowed(IErc20 collateral, bool state) external override onlyOwner {
        if (!collaterals[collateral].isListed) {
            revert Fintroller__CollateralNotListed(collateral);
        }
        collaterals[collateral].isDepositCollateralAllowed = state;
        emit SetDepositCollateralAllowed(owner, collateral, state);
    }

    /// @inheritdoc IFintroller
    function setDepositUnderlyingAllowed(IHToken bond, bool state) external override onlyOwner {
        if (!bonds[bond].isListed) {
            revert Fintroller__BondNotListed(bond);
        }
        bonds[bond].isDepositUnderlyingAllowed = state;
        emit SetDepositUnderlyingAllowed(owner, bond, state);
    }

    /// @inheritdoc IFintroller
    function setLiquidateBorrowAllowed(IHToken bond, bool state) external override onlyOwner {
        if (!bonds[bond].isListed) {
            revert Fintroller__BondNotListed(bond);
        }

        if (state && !bonds[bond].isRepayBorrowAllowed) {
            revert Fintroller__BondLiquidateBorrowAllowedWithRepayBorrowDisallowed();
        }
        if (!state && bonds[bond].isBorrowAllowed) {
            revert Fintroller__BondLiquidateBorrowDisallowedWithBorrowAllowed();
        }

        bonds[bond].isLiquidateBorrowAllowed = state;
        emit SetLiquidateBorrowAllowed(owner, bond, state);
    }

    /// @inheritdoc IFintroller
    function setLiquidationIncentive(IErc20 collateral, uint256 newLiquidationIncentive) external override onlyOwner {
        // Checks: collateral is listed.
        if (!collaterals[collateral].isListed) {
            revert Fintroller__CollateralNotListed(collateral);
        }

        // Checks: new collateral ratio is within the accepted bounds.
        if (newLiquidationIncentive > LIQUIDATION_INCENTIVE_UPPER_BOUND) {
            revert Fintroller__LiquidationIncentiveOverflow(newLiquidationIncentive);
        }
        if (newLiquidationIncentive < LIQUIDATION_INCENTIVE_LOWER_BOUND) {
            revert Fintroller__LiquidationIncentiveUnderflow(newLiquidationIncentive);
        }
        if (newLiquidationIncentive > collaterals[collateral].ratio) {
            revert Fintroller__LiquidationIncentiveAboveCollateralRatio(newLiquidationIncentive);
        }

        // Effects: update storage.
        uint256 oldLiquidationIncentive = collaterals[collateral].liquidationIncentive;
        collaterals[collateral].liquidationIncentive = newLiquidationIncentive;

        emit SetLiquidationIncentive(owner, collateral, oldLiquidationIncentive, newLiquidationIncentive);
    }

    /// @inheritdoc IFintroller
    function setMaxBonds(uint256 newMaxBonds) external override onlyOwner {
        uint256 oldMaxBonds = maxBonds;
        maxBonds = newMaxBonds;
        emit SetMaxBonds(owner, oldMaxBonds, newMaxBonds);
    }

    /// @inheritdoc IFintroller
    function setMaxCollaterals(uint256 newMaxCollaterals) external override onlyOwner {
        uint256 oldMaxCollaterals = maxCollaterals;
        maxCollaterals = newMaxCollaterals;
        emit SetMaxCollaterals(owner, oldMaxCollaterals, newMaxCollaterals);
    }

    /// @inheritdoc IFintroller
    function setRepayBorrowAllowed(IHToken bond, bool state) external override onlyOwner {
        if (!bonds[bond].isListed) {
            revert Fintroller__BondNotListed(bond);
        }

        if (!state && bonds[bond].isLiquidateBorrowAllowed) {
            revert Fintroller__BondRepayBorrowDisallowedWithLiquidateBorrowAllowed();
        }

        bonds[bond].isRepayBorrowAllowed = state;
        emit SetRepayBorrowAllowed(owner, bond, state);
    }
}
