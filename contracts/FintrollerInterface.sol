/// SPDX-License-Identifier: LPGL-3.0-or-later
pragma solidity ^0.8.0;

import "./FintrollerStorage.sol";
import "./FyTokenInterface.sol";
import "./oracles/ChainlinkOperatorInterface.sol";

abstract contract FintrollerInterface is FintrollerStorage {
    /// EVENTS ///

    event ListBond(address indexed admin, FyTokenInterface indexed fyToken);

    event SetBorrowAllowed(address indexed admin, FyTokenInterface indexed fyToken, bool state);

    event SetBondCollateralizationRatio(
        address indexed admin,
        FyTokenInterface indexed fyToken,
        uint256 oldCollateralizationRatio,
        uint256 newCollateralizationRatio
    );

    event SetBondDebtCeiling(
        address indexed admin,
        FyTokenInterface indexed fyToken,
        uint256 oldDebtCeiling,
        uint256 newDebtCeiling
    );

    event SetBondLiquidationIncentive(
        address indexed admin,
        FyTokenInterface fyToken,
        uint256 oldLiquidationIncentive,
        uint256 newLiquidationIncentive
    );

    event SetDepositCollateralAllowed(address indexed admin, FyTokenInterface indexed fyToken, bool state);

    event SetLiquidateBorrowAllowed(address indexed admin, FyTokenInterface indexed fyToken, bool state);

    event SetRedeemFyTokensAllowed(address indexed admin, FyTokenInterface indexed fyToken, bool state);

    event SetRepayBorrowAllowed(address indexed admin, FyTokenInterface indexed fyToken, bool state);

    event SetOracle(address indexed admin, address oldOracle, address newOracle);

    event SetSupplyUnderlyingAllowed(address indexed admin, FyTokenInterface indexed fyToken, bool state);

    /// CONSTANT FUNCTIONS ///

    /// @notice Reads the storage properties of the bond.
    /// @dev It is not an error to provide an invalid fyToken address. The returned values would all be zero.
    /// @param fyToken The address of the bond contract.
    /// @return The bond object.
    function getBond(FyTokenInterface fyToken) external view virtual returns (Bond memory);

    /// @notice Reads the collateralization ratio of the given bond.
    /// @dev It is not an error to provide an invalid fyToken address.
    /// @param fyToken The address of the bond contract.
    /// @return The collateralization ratio as a mantissa, or zero if an invalid address was provided.
    function getBondCollateralizationRatio(FyTokenInterface fyToken) external view virtual returns (uint256);

    /// @notice Reads the debt ceiling of the given bond.
    /// @dev It is not an error to provide an invalid fyToken address.
    /// @param fyToken The address of the bond contract.
    /// @return The debt ceiling as a uint256, or zero if an invalid address was provided.
    function getBondDebtCeiling(FyTokenInterface fyToken) external view virtual returns (uint256);

    /// @notice Reads the liquidation incentive of the given bond.
    /// @dev It is not an error to provide an invalid fyToken address.
    /// @param fyToken The address of the bond contract.
    /// @return The liquidation incentive as a mantissa, or zero if an invalid address was provided.
    function getBondLiquidationIncentive(FyTokenInterface fyToken) external view virtual returns (uint256);

    /// @notice Check if the account should be allowed to borrow fyTokens.
    /// @dev The bond must be listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getBorrowAllowed(FyTokenInterface fyToken) external view virtual returns (bool);

    /// @notice Checks if the account should be allowed to deposit collateral.
    /// @dev The bond must be listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getDepositCollateralAllowed(FyTokenInterface fyToken) external view virtual returns (bool);

    /// @notice Check if the account should be allowed to liquidate fyToken borrows.
    /// @dev The bond must be listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getLiquidateBorrowAllowed(FyTokenInterface fyToken) external view virtual returns (bool);

    /// @notice Checks if the account should be allowed to redeem the underlying from the RedemptionPool.
    /// @dev The bond must be listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getRedeemFyTokensAllowed(FyTokenInterface fyToken) external view virtual returns (bool);

    /// @notice Checks if the account should be allowed to repay borrows.
    /// @dev The bond must be listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getRepayBorrowAllowed(FyTokenInterface fyToken) external view virtual returns (bool);

    /// @notice Checks if the account should be allowed to the supply underlying to the RedemptionPool.
    /// @dev The bond must be listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = allowed, false = not allowed.
    function getSupplyUnderlyingAllowed(FyTokenInterface fyToken) external view virtual returns (bool);

    /// @notice Checks if the bond is listed.
    /// @param fyToken The bond to make the check against.
    /// @return bool true = listed, otherwise not.
    function isBondListed(FyTokenInterface fyToken) external view virtual returns (bool);

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
    /// @return bool true = success, otherwise it reverts.
    function listBond(FyTokenInterface fyToken) external virtual returns (bool);

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
    /// @return bool true = success, otherwise it reverts.
    function setBondCollateralizationRatio(FyTokenInterface fyToken, uint256 newCollateralizationRatioMantissa)
        external
        virtual
        returns (bool);

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
    /// @return bool true = success, otherwise it reverts.
    function setBondDebtCeiling(FyTokenInterface fyToken, uint256 newDebtCeiling) external virtual returns (bool);

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
    /// @return bool true = success, otherwise it reverts.
    function setBondLiquidationIncentive(FyTokenInterface fyToken, uint256 newLiquidationIncentive)
        external
        virtual
        returns (bool);

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
    /// @return bool true = success, otherwise it reverts.
    function setBorrowAllowed(FyTokenInterface fyToken, bool state) external virtual returns (bool);

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
    /// @return bool true = success, otherwise it reverts.
    function setDepositCollateralAllowed(FyTokenInterface fyToken, bool state) external virtual returns (bool);

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
    /// @return bool true = success, otherwise it reverts.
    function setLiquidateBorrowAllowed(FyTokenInterface fyToken, bool state) external virtual returns (bool);

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
    /// @return bool true = success, otherwise it reverts.
    function setOracle(ChainlinkOperatorInterface newOracle) external virtual returns (bool);

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
    /// @return bool true = success, otherwise it reverts.
    function setRedeemFyTokensAllowed(FyTokenInterface fyToken, bool state) external virtual returns (bool);

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
    /// @return bool true = success, otherwise it reverts.
    function setRepayBorrowAllowed(FyTokenInterface fyToken, bool state) external virtual returns (bool);

    /// @notice Updates the state of the permission accessed by the RedemptionPool before a supply of underlying.
    ///
    /// @dev Emits a {SetSupplyUnderlyingAllowed} event.
    ///
    /// Requirements:
    /// - The caller must be the admin
    ///
    /// @param fyToken The fyToken contract to update the permission for.
    /// @param state The new state to put in storage.
    /// @return bool true = success, otherwise it reverts.
    function setSupplyUnderlyingAllowed(FyTokenInterface fyToken, bool state) external virtual returns (bool);
}
