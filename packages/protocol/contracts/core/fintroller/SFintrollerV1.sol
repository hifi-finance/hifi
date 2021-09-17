// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";

import "../hToken/IHToken.sol";

/// @notice SFintrollerV1
/// @author Hifi
abstract contract SFintrollerV1 {
    /// STRUCTS ///
    struct Bond {
        uint256 debtCeiling;
        bool isBorrowAllowed;
        bool isLiquidateBorrowAllowed;
        bool isListed;
        bool isRedeemHTokenAllowed;
        bool isRepayBorrowAllowed;
        bool isSupplyUnderlyingAllowed;
    }

    struct Collateral {
        uint256 ceiling;
        uint256 ratio;
        uint256 liquidationIncentive;
        bool isDepositCollateralAllowed;
        bool isListed;
    }

    /// PUBLIC STORAGE ///

    /// @notice The maximum number of bond markets a single account can enter.
    uint256 public maxBonds;

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

    /// @dev The threshold below which the liquidation incentive cannot be set, equivalent to 100%.
    uint256 internal constant LIQUIDATION_INCENTIVE_LOWER_BOUND = 1.0e18;

    /// @dev The threshold above which the liquidation incentive cannot be set, equivalent to 150%.
    uint256 internal constant LIQUIDATION_INCENTIVE_UPPER_BOUND = 1.5e18;

    /// @notice Maps hTokens to Bond structs.
    mapping(IHToken => Bond) internal bonds;

    /// @notice Maps IErc20s to Collateral structs.
    mapping(IErc20 => Collateral) internal collaterals;
}
