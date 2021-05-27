/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/IAdmin.sol";

import "./IHToken.sol";
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
        bool isRedeemHTokenAllowed;
        bool isRepayBorrowAllowed;
        bool isSupplyUnderlyingAllowed;
    }

    /// EVENTS ///

    /// @notice Emitted when a bond is listed.
    /// @param admin The address of the admin.
    /// @param hToken The new listed token.
    event ListBond(address indexed admin, IHToken indexed hToken);

    /// @notice Emitted when the borrowing of a HToken is set.
    /// @param admin The address of the admin.
    /// @param hToken The related HToken.
    /// @param state True if borrowing is allowed.
    event SetBorrowAllowed(address indexed admin, IHToken indexed hToken, bool state);

    /// @notice Emitted when the collateralization ratio is updated.
    /// @param admin The address of the admin.
    /// @param hToken The related HToken.
    /// @param oldCollateralizationRatio The old collateralization ratio.
    /// @param newCollateralizationRatio the new collateralization ratio.
    event SetBondCollateralizationRatio(
        address indexed admin,
        IHToken indexed hToken,
        uint256 oldCollateralizationRatio,
        uint256 newCollateralizationRatio
    );

    /// @notice Emitted when the debt ceiling of a bond is set.
    /// @param admin The address of the admin.
    /// @param hToken The related HToken.
    /// @param oldDebtCeiling The old debt ceiling.
    /// @param newDebtCeiling The new debt ceiling.
    event SetBondDebtCeiling(
        address indexed admin,
        IHToken indexed hToken,
        uint256 oldDebtCeiling,
        uint256 newDebtCeiling
    );

    /// @notice Emitted when the liquidation incentive is set.
    /// @param admin The address of the admin.
    /// @param hToken The related HToken.
    /// @param oldLiquidationIncentive The old liquidation incentive.
    /// @param newLiquidationIncentive The new liquidation incentive.
    event SetBondLiquidationIncentive(
        address indexed admin,
        IHToken hToken,
        uint256 oldLiquidationIncentive,
        uint256 newLiquidationIncentive
    );

    /// @notice Emitted when depositing collateral is updated.
    /// @param admin The address of the admin.
    /// @param hToken The related HToken.
    /// @param state True if depositing collateral is allowed.
    event SetDepositCollateralAllowed(address indexed admin, IHToken indexed hToken, bool state);

    /// @notice Emitted when liquidating borrow is updated.
    /// @param admin The address of the admin.
    /// @param hToken The related HToken.
    /// @param state True if liquidating borrow is allowed.
    event SetLiquidateBorrowAllowed(address indexed admin, IHToken indexed hToken, bool state);

    /// @notice Emitted when redeeming hTokens is updated.
    /// @param admin The address of the admin.
    /// @param hToken The related HToken.
    /// @param state True if redeeming hTokens is allowed.
    event SetRedeemHTokensAllowed(address indexed admin, IHToken indexed hToken, bool state);

    /// @notice Emitted when repaying borrow is updated.
    /// @param admin The address of the admin.
    /// @param hToken The related HToken.
    /// @param state True if repaying borrow is allowed.
    event SetRepayBorrowAllowed(address indexed admin, IHToken indexed hToken, bool state);

    /// @notice Emitted when a new oracle is set.
    /// @param admin The address of the admin.
    /// @param oldOracle The address of the old oracle.
    /// @param newOracle The address of the new oracle.
    event SetOracle(address indexed admin, address oldOracle, address newOracle);

    /// @notice Emitted when supplying underlying is set.
    /// @param admin The address of the admin.
    /// @param hToken The related HToken.
    /// @param state True if supplying underlying is allowed.
    event SetSupplyUnderlyingAllowed(address indexed admin, IHToken indexed hToken, bool state);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Marks the bond as listed in this Fintroller's registry. It is not an error to list a bond twice.
    ///
    /// @dev Emits a {ListBond} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The hToken must pass the inspection.
    ///
    /// @param hToken The hToken contract to list.
    function listBond(IHToken hToken) external;

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
    /// @param hToken The bond for which to update the collateralization ratio.
    /// @param newCollateralizationRatio The new collateralization ratio.
    function setBondCollateralizationRatio(IHToken hToken, uint256 newCollateralizationRatio) external;

    /// @notice Updates the debt ceiling, which limits how much debt can be issued for this specific bond.
    ///
    /// @dev Emits a {SetBondDebtCeiling} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    /// - The debt ceiling cannot be zero.
    /// - The debt ceiling cannot fall below the current total supply of hTokens.
    ///
    /// @param hToken The bond for which to update the debt ceiling.
    /// @param newDebtCeiling The uint256 value of the new debt ceiling, specified in the bond's decimal system.
    function setBondDebtCeiling(IHToken hToken, uint256 newDebtCeiling) external;

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
    /// @param hToken The bond for which to update the liquidation incentive.
    /// @param newLiquidationIncentive The new liquidation incentive.
    function setBondLiquidationIncentive(IHToken hToken, uint256 newLiquidationIncentive) external;

    /// @notice Updates the state of the permission accessed by the hToken before a borrow.
    ///
    /// @dev Emits a {SetBorrowAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param hToken The hToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setBorrowAllowed(IHToken hToken, bool state) external;

    /// @notice Updates the state of the permission accessed by the hToken before a collateral deposit.
    ///
    /// @dev Emits a {SetDepositCollateralAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param hToken The hToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setDepositCollateralAllowed(IHToken hToken, bool state) external;

    /// @notice Updates the state of the permission accessed by the hToken before a liquidate borrow.
    ///
    /// @dev Emits a {SetLiquidateBorrowAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param hToken The hToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setLiquidateBorrowAllowed(IHToken hToken, bool state) external;

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
    /// @dev Emits a {SetRedeemHTokensAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param hToken The hToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setRedeemHTokensAllowed(IHToken hToken, bool state) external;

    /// @notice Updates the state of the permission accessed by the hToken before a repay borrow.
    ///
    /// @dev Emits a {SetRepayBorrowAllowed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The bond must be listed.
    ///
    /// @param hToken The hToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setRepayBorrowAllowed(IHToken hToken, bool state) external;

    /// @notice Updates the state of the permission accessed by the RedemptionPool before a supply of underlying.
    ///
    /// @dev Emits a {SetSupplyUnderlyingAllowed} event.
    ///
    /// Requirements:
    /// - The caller must be the admin
    ///
    /// @param hToken The hToken contract to update the permission for.
    /// @param state The new state to put in storage.
    function setSupplyUnderlyingAllowed(IHToken hToken, bool state) external;

    /// CONSTANT FUNCTIONS ///

    /// @notice Reads the storage properties of the bond.
    /// @dev It is not an error to provide an invalid hToken address. The returned values would all be zero.
    /// @param hToken The address of the bond contract.
    /// @return The bond object.
    function getBond(IHToken hToken) external view returns (Bond memory);

    /// @notice Reads the collateralization ratio of the given bond.
    /// @dev It is not an error to provide an invalid hToken address.
    /// @param hToken The address of the bond contract.
    /// @return The collateralization ratio, or zero if an invalid address was provided.
    function getBondCollateralizationRatio(IHToken hToken) external view returns (uint256);

    /// @notice Reads the debt ceiling of the given bond.
    /// @dev It is not an error to provide an invalid hToken address.
    /// @param hToken The address of the bond contract.
    /// @return The debt ceiling as a uint256, or zero if an invalid address was provided.
    function getBondDebtCeiling(IHToken hToken) external view returns (uint256);

    /// @notice Reads the liquidation incentive of the given bond.
    /// @dev It is not an error to provide an invalid hToken address.
    /// @param hToken The address of the bond contract.
    /// @return The liquidation incentive, or zero if an invalid address was provided.
    function getBondLiquidationIncentive(IHToken hToken) external view returns (uint256);

    /// @notice Check if the account should be allowed to borrow hTokens.
    /// @dev The bond must be listed.
    /// @param hToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getBorrowAllowed(IHToken hToken) external view returns (bool);

    /// @notice Checks if the account should be allowed to deposit collateral.
    /// @dev The bond must be listed.
    /// @param hToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getDepositCollateralAllowed(IHToken hToken) external view returns (bool);

    /// @notice Check if the account should be allowed to liquidate hToken borrows.
    /// @dev The bond must be listed.
    /// @param hToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getLiquidateBorrowAllowed(IHToken hToken) external view returns (bool);

    /// @notice Checks if the account should be allowed to redeem the underlying from the RedemptionPool.
    /// @dev The bond must be listed.
    /// @param hToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getRedeemHTokensAllowed(IHToken hToken) external view returns (bool);

    /// @notice Checks if the account should be allowed to repay borrows.
    /// @dev The bond must be listed.
    /// @param hToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getRepayBorrowAllowed(IHToken hToken) external view returns (bool);

    /// @notice Checks if the account should be allowed to the supply underlying to the RedemptionPool.
    /// @dev The bond must be listed.
    /// @param hToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getSupplyUnderlyingAllowed(IHToken hToken) external view returns (bool);

    /// @notice Checks if the bond is listed.
    /// @param hToken The bond to make the check against.
    /// @return bool true = listed, otherwise not.
    function isBondListed(IHToken hToken) external view returns (bool);

    /// @notice Indicator that this is a Fintroller contract, for inspection.
    function isFintroller() external view returns (bool);

    /// @notice The contract that provides price data for the collateral and the underlying asset.
    function oracle() external view returns (IChainlinkOperator);
}
