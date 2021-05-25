/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/IAdmin.sol";

import "./IFyToken.sol";
import "./oracles/IChainlinkOperator.sol";

/// @notice IFintroller
/// @author Hifi
/// @notice Interface for the Fintroller contract.
interface IFintroller is IAdmin {
    struct Bond {
        uint256 collateralizationRatio;
        uint256 debtCeiling;
        uint256 liquidationIncentive;
        bool isBorrowAllowed;
        bool isDepositCollateralAllowed;
        bool isLiquidateBorrowAllowed;
        bool isListed;
        bool isRedeemFyTokenAllowed;
        bool isRepayBorrowAllowed;
        bool isSupplyUnderlyingAllowed;
    }

    /// EVENTS ///

    /// @notice Emitted when a bond is listed.
    /// @param admin The address of the admin.
    /// @param fyToken The new listed token.
    event ListBond(address indexed admin, IFyToken indexed fyToken);

    /// @notice Emitted when the borrowing of a FyToken is set.
    /// @param admin The address of the admin.
    /// @param fyToken The related FyToken.
    /// @param state True if borrowing is allowed.
    event SetBorrowAllowed(address indexed admin, IFyToken indexed fyToken, bool state);

    /// @notice Emitted when the collateralization ratio is updated.
    /// @param admin The address of the admin.
    /// @param fyToken The related FyToken.
    /// @param oldCollateralizationRatio The old collateralization ratio.
    /// @param newCollateralizationRatio the new collateralization ratio.
    event SetBondCollateralizationRatio(
        address indexed admin,
        IFyToken indexed fyToken,
        uint256 oldCollateralizationRatio,
        uint256 newCollateralizationRatio
    );

    /// @notice Emitted when the debt ceiling of a bond is set.
    /// @param admin The address of the admin.
    /// @param fyToken The related FyToken.
    /// @param oldDebtCeiling The old debt ceiling.
    /// @param newDebtCeiling The new debt ceiling.
    event SetBondDebtCeiling(
        address indexed admin,
        IFyToken indexed fyToken,
        uint256 oldDebtCeiling,
        uint256 newDebtCeiling
    );

    /// @notice Emitted when the liquidation incentive is set.
    /// @param admin The address of the admin.
    /// @param fyToken The related FyToken.
    /// @param oldLiquidationIncentive The old liquidation incentive.
    /// @param newLiquidationIncentive The new liquidation incentive.
    event SetBondLiquidationIncentive(
        address indexed admin,
        IFyToken fyToken,
        uint256 oldLiquidationIncentive,
        uint256 newLiquidationIncentive
    );

    /// @notice Emitted when depositing collateral is updated.
    /// @param admin The address of the admin.
    /// @param fyToken The related FyToken.
    /// @param state True if depositing collateral is allowed.
    event SetDepositCollateralAllowed(address indexed admin, IFyToken indexed fyToken, bool state);

    /// @notice Emitted when liquidating borrow is updated.
    /// @param admin The address of the admin.
    /// @param fyToken The related FyToken.
    /// @param state True if liquidating borrow is allowed.
    event SetLiquidateBorrowAllowed(address indexed admin, IFyToken indexed fyToken, bool state);

    /// @notice Emitted when redeeming fyTokens is updated.
    /// @param admin The address of the admin.
    /// @param fyToken The related FyToken.
    /// @param state True if redeeming fyTokens is allowed.
    event SetRedeemFyTokensAllowed(address indexed admin, IFyToken indexed fyToken, bool state);

    /// @notice Emitted when repaying borrow is updated.
    /// @param admin The address of the admin.
    /// @param fyToken The related FyToken.
    /// @param state True if repaying borrow is allowed.
    event SetRepayBorrowAllowed(address indexed admin, IFyToken indexed fyToken, bool state);

    /// @notice Emitted when a new oracle is set.
    /// @param admin The address of the admin.
    /// @param oldOracle The address of the old oracle.
    /// @param newOracle The address of the new oracle.
    event SetOracle(address indexed admin, address oldOracle, address newOracle);

    /// @notice Emitted when supplying underlying is set.
    /// @param admin The address of the admin.
    /// @param fyToken The related FyToken.
    /// @param state True if supplying underlying is allowed.
    event SetSupplyUnderlyingAllowed(address indexed admin, IFyToken indexed fyToken, bool state);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Marks the bond as listed in this Fintroller's registry. It is not an error to list a bond twice.
    ///
    /// @dev Emits a {ListBond} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The fyToken must pass the inspection.
    ///
    /// @param fyToken The fyToken contract to list.
    function listBond(IFyToken fyToken) external;

    /// @notice Updates the bond's collateralization ratio.
    ///
    /// @dev Emits a {SetBondCollateralizationRatio} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    /// - The new collateralization ratio cannot be higher than the maximum collateralization ratio.
    /// - The new collateralization ratio cannot be lower than the minimum collateralization ratio.
    ///
    /// @param fyToken The bond for which to update the collateralization ratio.
    /// @param newCollateralizationRatioMantissa The new collateralization ratio as a mantissa.
    function setBondCollateralizationRatio(IFyToken fyToken, uint256 newCollateralizationRatioMantissa) external;

    /// @notice Updates the debt ceiling, which limits how much debt can be issued for this specific bond.
    ///
    /// @dev Emits a {SetBondDebtCeiling} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    /// - The debt ceiling cannot be zero.
    /// - The debt ceiling cannot fall below the current total supply of fyTokens.
    ///
    /// @param fyToken The bond for which to update the debt ceiling.
    /// @param newDebtCeiling The uint256 value of the new debt ceiling, specified in the bond's decimal system.
    function setBondDebtCeiling(IFyToken fyToken, uint256 newDebtCeiling) external;

    /// @notice Sets a new value for the liquidation incentive applicable to this specific bond.
    ///
    /// @dev Emits a {SetBondLiquidationIncentive} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    /// - The new liquidation incentive cannot be higher than the maximum liquidation incentive.
    /// - The new liquidation incentive cannot be lower than the minimum liquidation incentive.
    ///
    /// @param fyToken The bond for which to update the liquidation incentive.
    /// @param newLiquidationIncentive The new liquidation incentive as a mantissa.
    function setBondLiquidationIncentive(IFyToken fyToken, uint256 newLiquidationIncentive) external;

    /// @notice Updates the state of the permission accessed by the fyToken before a borrow.
    ///
    /// @dev Emits a {SetBorrowAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param fyToken The fyToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setBorrowAllowed(IFyToken fyToken, bool state) external;

    /// @notice Updates the state of the permission accessed by the fyToken before a collateral deposit.
    ///
    /// @dev Emits a {SetDepositCollateralAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param fyToken The fyToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setDepositCollateralAllowed(IFyToken fyToken, bool state) external;

    /// @notice Updates the state of the permission accessed by the fyToken before a liquidate borrow.
    ///
    /// @dev Emits a {SetLiquidateBorrowAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param fyToken The fyToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setLiquidateBorrowAllowed(IFyToken fyToken, bool state) external;

    /// @notice Updates the oracle contract's address saved in storage.
    ///
    /// @dev Emits a {SetOracle} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The new address cannot be the zero address.
    ///
    /// @param newOracle The new oracle contract.
    function setOracle(IChainlinkOperator newOracle) external;

    /// @notice Updates the state of the permission accessed by the RedemptionPool before a redemption of underlying.
    ///
    /// @dev Emits a {SetRedeemFyTokensAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param fyToken The fyToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setRedeemFyTokensAllowed(IFyToken fyToken, bool state) external;

    /// @notice Updates the state of the permission accessed by the fyToken before a repay borrow.
    ///
    /// @dev Emits a {SetRepayBorrowAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param fyToken The fyToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setRepayBorrowAllowed(IFyToken fyToken, bool state) external;

    /// @notice Updates the state of the permission accessed by the RedemptionPool before a supply of underlying.
    ///
    /// @dev Emits a {SetSupplyUnderlyingAllowed} event.
    ///
    /// Requirements:
    /// - The caller must be the admin
    ///
    /// @param fyToken The fyToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setSupplyUnderlyingAllowed(IFyToken fyToken, bool state) external;

    /// CONSTANT FUNCTIONS ///

    /// @notice Reads the storage properties of the bond.
    /// @dev It is not an error to provide an invalid fyToken address. The returned values would all be zero.
    /// @param fyToken The address of the bond contract.
    /// @return The bond object.
    function getBond(IFyToken fyToken) external view returns (Bond memory);

    /// @notice Reads the collateralization ratio of the given bond.
    /// @dev It is not an error to provide an invalid fyToken address.
    /// @param fyToken The address of the bond contract.
    /// @return The collateralization ratio as a mantissa, or zero if an invalid address was provided.
    function getBondCollateralizationRatio(IFyToken fyToken) external view returns (uint256);

    /// @notice Reads the debt ceiling of the given bond.
    /// @dev It is not an error to provide an invalid fyToken address.
    /// @param fyToken The address of the bond contract.
    /// @return The debt ceiling as a uint256, or zero if an invalid address was provided.
    function getBondDebtCeiling(IFyToken fyToken) external view returns (uint256);

    /// @notice Reads the liquidation incentive of the given bond.
    /// @dev It is not an error to provide an invalid fyToken address.
    /// @param fyToken The address of the bond contract.
    /// @return The liquidation incentive as a mantissa, or zero if an invalid address was provided.
    function getBondLiquidationIncentive(IFyToken fyToken) external view returns (uint256);

    /// @notice Check if the account should be allowed to borrow fyTokens.
    /// @dev The bond must be listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getBorrowAllowed(IFyToken fyToken) external view returns (bool);

    /// @notice Checks if the account should be allowed to deposit collateral.
    /// @dev The bond must be listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getDepositCollateralAllowed(IFyToken fyToken) external view returns (bool);

    /// @notice Check if the account should be allowed to liquidate fyToken borrows.
    /// @dev The bond must be listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getLiquidateBorrowAllowed(IFyToken fyToken) external view returns (bool);

    /// @notice Checks if the account should be allowed to redeem the underlying from the RedemptionPool.
    /// @dev The bond must be listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getRedeemFyTokensAllowed(IFyToken fyToken) external view returns (bool);

    /// @notice Checks if the account should be allowed to repay borrows.
    /// @dev The bond must be listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getRepayBorrowAllowed(IFyToken fyToken) external view returns (bool);

    /// @notice Checks if the account should be allowed to the supply underlying to the RedemptionPool.
    /// @dev The bond must be listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getSupplyUnderlyingAllowed(IFyToken fyToken) external view returns (bool);

    /// @notice Checks if the bond is listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = listed, otherwise not.
    function isBondListed(IFyToken fyToken) external view returns (bool);

    /// @notice Indicator that this is a Fintroller contract, for inspection.
    function isFintroller() external view returns (bool);

    /// @notice The contract that provides price data for the collateral and the underlying asset.
    function oracle() external view returns (IChainlinkOperator);
}
