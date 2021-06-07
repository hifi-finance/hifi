/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/access/IAdmin.sol";
import "@paulrberg/contracts/token/erc20/IErc20.sol";

import "./IHToken.sol";

/// @notice IFintroller
/// @author Hifi
/// @notice Controls the financial permissions and risk parameters for the Hifi protocol.
interface IFintroller is IAdmin {
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
        uint256 collateralizationRatio;
        uint256 liquidationIncentive;
        bool isDepositCollateralAllowed;
        bool isListed;
    }

    /// EVENTS ///

    /// @notice Emitted when a new bond is listed.
    /// @param admin The address of the admin.
    /// @param bond The newly listed bond.
    event ListBond(address indexed admin, IHToken indexed bond);

    /// @notice Emitted when a new collateral is listed.
    /// @param admin The address of the admin.
    /// @param collateral The newly listed collateral.
    event ListCollateral(address indexed admin, IErc20 indexed collateral);

    /// @notice Emitted when the borrow permission is updated.
    /// @param admin The address of the admin.
    /// @param bond The related HToken.
    /// @param state True if borrowing is allowed.
    event SetBorrowAllowed(address indexed admin, IHToken indexed bond, bool state);

    /// @notice Emitted when the bond collateralization ratio is updated.
    /// @param admin The address of the admin.
    /// @param collateral The related HToken.
    /// @param oldCollateralizationRatio The old collateralization ratio.
    /// @param newCollateralizationRatio the new collateralization ratio.
    event SetCollateralizationRatio(
        address indexed admin,
        IErc20 indexed collateral,
        uint256 oldCollateralizationRatio,
        uint256 newCollateralizationRatio
    );

    /// @notice Emitted when the bond debt ceiling is set.
    /// @param admin The address of the admin.
    /// @param bond The related HToken.
    /// @param oldDebtCeiling The old debt ceiling.
    /// @param newDebtCeiling The new debt ceiling.
    event SetDebtCeiling(address indexed admin, IHToken indexed bond, uint256 oldDebtCeiling, uint256 newDebtCeiling);

    /// @notice Emitted when the deposit collateral permission is updated.
    /// @param admin The address of the admin.
    /// @param state True if depositing collateral is allowed.
    event SetDepositCollateralAllowed(address indexed admin, IErc20 indexed collateral, bool state);

    /// @notice Emitted when the liquidate borrow permission is updated.
    /// @param admin The address of the admin.
    /// @param bond The related HToken.
    /// @param state True if liquidating borrow is allowed.
    event SetLiquidateBorrowAllowed(address indexed admin, IHToken indexed bond, bool state);

    /// @notice Emitted when the collateral liquidation incentive is set.
    /// @param admin The address of the admin.
    /// @param collateral The related collateral.
    /// @param oldLiquidationIncentive The old liquidation incentive.
    /// @param newLiquidationIncentive The new liquidation incentive.
    event SetLiquidationIncentive(
        address indexed admin,
        IErc20 collateral,
        uint256 oldLiquidationIncentive,
        uint256 newLiquidationIncentive
    );

    /// @notice Emitted when a new max bonds value is set.
    /// @param admin The address indexed admin.
    /// @param oldMaxBonds The address of the old max bonds value.
    /// @param newMaxBonds The address of the new max bonds value.
    event SetMaxBonds(address indexed admin, uint256 oldMaxBonds, uint256 newMaxBonds);

    /// @notice Emitted when the redeem hTokens permission is updated.
    /// @param admin The address of the admin.
    /// @param bond The related HToken.
    /// @param state True if redeeming hTokens is allowed.
    event SetRedeemHTokensAllowed(address indexed admin, IHToken indexed bond, bool state);

    /// @notice Emitted when the repay borrow permission is updated.
    /// @param admin The address of the admin.
    /// @param bond The related HToken.
    /// @param state True if repaying borrow is allowed.
    event SetRepayBorrowAllowed(address indexed admin, IHToken indexed bond, bool state);

    /// @notice Emitted when the supply underlying permission is set.
    /// @param admin The address of the admin.
    /// @param bond The related HToken.
    /// @param state True if supplying underlying is allowed.
    event SetSupplyUnderlyingAllowed(address indexed admin, IHToken indexed bond, bool state);

    /// CONSTANT FUNCTIONS ///

    /// @notice Returns the Bond struct instance associated to the given address.
    /// @dev It is not an error to provide an invalid address.
    /// @param bond The address of the bond contract.
    /// @return The bond object.
    function getBond(IHToken bond) external view returns (Bond memory);

    /// @notice Checks if the account should be allowed to borrow hTokens.
    /// @dev The bond must be listed.
    /// @param bond The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getBorrowAllowed(IHToken bond) external view returns (bool);

    /// @notice Returns the Collateral struct instance associated to the given address.
    /// @dev It is not an error to provide an invalid address.
    /// @param collateral The address of the collateral contract.
    /// @return The collateral object.
    function getCollateral(IErc20 collateral) external view returns (Collateral memory);

    /// @notice Returns the collateralization ratio of the given collateral.
    /// @dev It is not an error to provide an invalid address.
    /// @param collateral The address of the collateral contract.
    /// @return The collateralization ratio, or zero if an invalid address was provided.
    function getCollateralizationRatio(IErc20 collateral) external view returns (uint256);

    /// @notice Returns the debt ceiling of the given bond.
    /// @dev It is not an error to provide an invalid address.
    /// @param bond The address of the bond contract.
    /// @return The debt ceiling as a uint256, or zero if an invalid address was provided.
    function getDebtCeiling(IHToken bond) external view returns (uint256);

    /// @notice Checks if collateral deposits are allowed.
    /// @dev The collateral must be listed.
    /// @param collateral The collateral contract to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getDepositCollateralAllowed(IErc20 collateral) external view returns (bool);

    /// @notice Returns the liquidation incentive of the given collateral.
    /// @dev It is not an error to provide an invalid address.
    /// @param collateral The address of the collateral contract.
    /// @return The liquidation incentive, or zero if an invalid address was provided.
    function getLiquidationIncentive(IErc20 collateral) external view returns (uint256);

    /// @notice Checks if the account should be allowed to liquidate hToken borrows.
    /// @dev The bond must be listed.
    /// @param bond The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getLiquidateBorrowAllowed(IHToken bond) external view returns (bool);

    /// @notice Checks if the account should be allowed to repay borrows.
    /// @dev The bond must be listed.
    /// @param bond The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getRepayBorrowAllowed(IHToken bond) external view returns (bool);

    /// @notice Checks if the bond is listed.
    /// @param bond The bond to make the check against.
    /// @return bool true = listed, otherwise not.
    function isBondListed(IHToken bond) external view returns (bool);

    /// @notice Checks if the collateral is listed.
    /// @param collateral The collateral to make the check against.
    /// @return bool true = listed, otherwise not.
    function isCollateralListed(IErc20 collateral) external view returns (bool);

    /// @notice Checks if collateral deposits are allowed.
    /// @param bond The bond to make the check against.
    /// @return bool true = listed, otherwise not.

    /// @notice Returns the maximum number of bond markets a single account can enter.
    function maxBonds() external view returns (uint256);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Marks the bond as listed in this registry.
    ///
    /// @dev Emits a {ListBond} event. It is not an error to list a bond twice.
    ///
    /// Requirements:
    /// - The caller must be the admin.
    ///
    /// @param bond The hToken contract to list.
    function listBond(IHToken bond) external;

    /// @notice Marks the collateral as listed in this registry.
    ///
    /// @dev Emits a {ListCollateral} event. It is not an error to list a bond twice.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The collateral must have between 1 and 18 decimals.
    ///
    /// @param collateral The collateral contract to list.
    function listCollateral(IErc20 collateral) external;

    /// @notice Updates the state of the permission accessed by the hToken before a borrow.
    ///
    /// @dev Emits a {SetBorrowAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param bond The bond to update the permission for.
    /// @param state The new state to put in storage.
    function setBorrowAllowed(IHToken bond, bool state) external;

    /// @notice Updates the collateral collateralization ratio.
    ///
    /// @dev Emits a {SetCollateralizationRatio} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The collateral must be listed.
    /// - The new collateralization ratio cannot be higher than the maximum collateralization ratio.
    /// - The new collateralization ratio cannot be lower than the minimum collateralization ratio.
    ///
    /// @param collateral The collateral to update the collateralization ratio for.
    /// @param newCollateralizationRatio The new collateralization ratio.
    function setCollateralizationRatio(IErc20 collateral, uint256 newCollateralizationRatio) external;

    /// @notice Updates the state of the permission accessed by the BalanceSheet before a collateral deposit.
    ///
    /// @dev Emits a {SetDepositCollateralAllowed} event.
    ///
    /// Requirements:
    /// - The caller must be the admin.
    ///
    /// @param collateral The collateral to update the permission for.
    /// @param state The new state to put in storage.
    function setDepositCollateralAllowed(IErc20 collateral, bool state) external;

    /// @notice Updates the bond debt ceiling.
    ///
    /// @dev Emits a {SetDebtCeiling} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    /// - The debt ceiling cannot be zero.
    /// - The debt ceiling cannot fall below the current total supply of hTokens.
    ///
    /// @param bond The bond to update the debt ceiling for.
    /// @param newDebtCeiling The uint256 value of the new debt ceiling, specified in the bond's decimal system.
    function setDebtCeiling(IHToken bond, uint256 newDebtCeiling) external;

    /// @notice Updates the collateral liquidation incentive.
    ///
    /// @dev Emits a {SetLiquidationIncentive} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The collateral must be listed.
    /// - The new liquidation incentive cannot be higher than the maximum liquidation incentive.
    /// - The new liquidation incentive cannot be lower than the minimum liquidation incentive.
    ///
    /// @param collateral The collateral to update the liquidation incentive for.
    /// @param newLiquidationIncentive The new liquidation incentive.
    function setLiquidationIncentive(IErc20 collateral, uint256 newLiquidationIncentive) external;

    /// @notice Updates the state of the permission accessed by the hToken before a liquidate borrow.
    ///
    /// @dev Emits a {SetLiquidateBorrowAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param bond The hToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setLiquidateBorrowAllowed(IHToken bond, bool state) external;

    /// @notice Sets max bonds value, which controls how many bond markets a single account can enter.
    ///
    /// @dev Emits a {SetMaxBonds} event.
    ///
    /// Requirements:
    /// - The caller must be the admin.
    ///
    /// @param newMaxBonds New max bonds value.
    function setMaxBonds(uint256 newMaxBonds) external;

    /// @notice Updates the state of the permission accessed by the hToken before a repay borrow.
    ///
    /// @dev Emits a {SetRepayBorrowAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param bond The hToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setRepayBorrowAllowed(IHToken bond, bool state) external;
}
