// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@prb/contracts/access/IOwnable.sol";
import "@prb/contracts/token/erc20/IErc20.sol";
import "@prb/contracts/token/erc20/IErc20Permit.sol";
import "@prb/contracts/token/erc20/IErc20Recover.sol";

import "../balance-sheet/IBalanceSheetV2.sol";
import "../fintroller/IFintroller.sol";

/// @title IHToken
/// @author Hifi
/// @notice Zero-coupon bond that tracks an Erc20 underlying asset.
interface IHToken is
    IOwnable, // no dependency
    IErc20Permit, // one dependency
    IErc20Recover // one dependency
{
    /// CUSTOM ERRORS ///

    /// @notice Emitted when the bond matured.
    error HToken__BondMatured(uint256 now, uint256 maturity);

    /// @notice Emitted when the bond did not mature.
    error HToken__BondNotMatured(uint256 now, uint256 maturity);

    /// @notice Emitted when burning hTokens and the caller is not the BalanceSheet contract.
    error HToken__BurnNotAuthorized(address caller);

    /// @notice Emitted when underlying deposits are not allowed by the Fintroller contract.
    error HToken__DepositUnderlyingNotAllowed();

    /// @notice Emitted when depositing a zero amount of underlying.
    error HToken__DepositUnderlyingZero();

    /// @notice Emitted when the maturity is in the past.
    error HToken__MaturityPassed(uint256 now, uint256 maturity);

    /// @notice Emitted when minting hTokens and the caller is not the BalanceSheet contract.
    error HToken__MintNotAuthorized(address caller);

    /// @notice Emitted when redeeming more underlying that there is in the reserve.
    error HToken__RedeemInsufficientLiquidity(uint256 underlyingAmount, uint256 totalUnderlyingReserve);

    /// @notice Emitted when redeeming a zero amount of underlying.
    error HToken__RedeemZero();

    /// @notice Emitted when constructing the contract and the underlying has more than 18 decimals.
    error HToken__UnderlyingDecimalsOverflow(uint256 decimals);

    /// @notice Emitted when constructing the contract and the underlying has zero decimals.
    error HToken__UnderlyingDecimalsZero();

    /// @notice Emitted when withdrawing more underlying than there is available.
    error HToken__WithdrawUnderlyingUnderflow(address depositor, uint256 availableAmount, uint256 underlyingAmount);

    /// @notice Emitted when withdrawing a zero amount of underlying.
    error HToken__WithdrawUnderlyingZero();

    /// EVENTS ///

    /// @notice Emitted when tokens are burnt.
    /// @param holder The address of the holder.
    /// @param burnAmount The amount of burnt tokens.
    event Burn(address indexed holder, uint256 burnAmount);

    /// @notice Emitted when underlying is deposited in exchange for an equivalent amount of hTokens.
    /// @param depositor The address of the depositor.
    /// @param depositUnderlyingAmount The amount of deposited underlying.
    /// @param hTokenAmount The amount of minted hTokens.
    event DepositUnderlying(address indexed depositor, uint256 depositUnderlyingAmount, uint256 hTokenAmount);

    /// @notice Emitted when tokens are minted.
    /// @param beneficiary The address of the holder.
    /// @param mintAmount The amount of minted tokens.
    event Mint(address indexed beneficiary, uint256 mintAmount);

    /// @notice Emitted when underlying is redeemed.
    /// @param account The account redeeming the underlying.
    /// @param underlyingAmount The amount of redeemed underlying.
    /// @param hTokenAmount The amount of provided hTokens.
    event Redeem(address indexed account, uint256 underlyingAmount, uint256 hTokenAmount);

    /// @notice Emitted when the BalanceSheet is set.
    /// @param owner The address of the owner.
    /// @param oldBalanceSheet The address of the old BalanceSheet.
    /// @param newBalanceSheet The address of the new BalanceSheet.
    event SetBalanceSheet(address indexed owner, IBalanceSheetV2 oldBalanceSheet, IBalanceSheetV2 newBalanceSheet);

    /// @notice Emitted when a depositor withdraws previously deposited underlying.
    /// @param depositor The address of the depositor.
    /// @param underlyingAmount The amount of withdrawn underlying.
    /// @param hTokenAmount The amount of minted hTokens.
    event WithdrawUnderlying(address indexed depositor, uint256 underlyingAmount, uint256 hTokenAmount);

    /// PUBLIC CONSTANT FUNCTIONS ///

    /// @notice Returns the BalanceSheet contract this HToken is connected to.
    function balanceSheet() external view returns (IBalanceSheetV2);

    /// @notice Returns the balance of the given depositor.
    function getDepositorBalance(address depositor) external view returns (uint256 amount);

    /// @notice Returns the Fintroller contract this HToken is connected to.
    function fintroller() external view returns (IFintroller);

    /// @notice Checks if the bond matured.
    /// @return bool true = bond matured, otherwise it didn't.
    function isMatured() external view returns (bool);

    /// @notice Unix timestamp in seconds for when this HToken matures.
    function maturity() external view returns (uint256);

    /// @notice The amount of underlying redeemable after maturation.
    function totalUnderlyingReserve() external view returns (uint256);

    /// @notice The Erc20 underlying asset for this HToken.
    function underlying() external view returns (IErc20);

    /// @notice The ratio between normalized precision (1e18) and the underlying precision.
    function underlyingPrecisionScalar() external view returns (uint256);

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @notice Destroys `burnAmount` tokens from `holder`, reducing the token supply.
    ///
    /// @dev Emits a {Burn} and a {Transfer} event.
    ///
    /// Requirements:
    /// - Can only be called by the BalanceSheet contract.
    ///
    /// @param holder The account whose hTokens to burn.
    /// @param burnAmount The amount of hTokens to burn.
    function burn(address holder, uint256 burnAmount) external;

    /// @notice Deposits underlying in exchange for an equivalent amount of hTokens.
    ///
    /// @dev Emits a {DepositUnderlying} event.
    ///
    /// Requirements:
    ///
    /// - The Fintroller must allow this action to be performed.
    /// - The underlying amount to deposit cannot be zero.
    /// - The caller must have allowed this contract to spend `underlyingAmount` tokens.
    ///
    /// @param underlyingAmount The amount of underlying to deposit.
    function depositUnderlying(uint256 underlyingAmount) external;

    /// @notice Prints new tokens into existence and assigns them to `beneficiary`, increasing the total supply.
    ///
    /// @dev Emits a {Mint} and a {Transfer} event.
    ///
    /// Requirements:
    /// - Can only be called by the BalanceSheet contract.
    ///
    /// @param beneficiary The account to mint the hTokens for.
    /// @param mintAmount The amount of hTokens to print into existence.
    function mint(address beneficiary, uint256 mintAmount) external;

    /// @notice Pays the token holder the face value after maturation.
    ///
    /// @dev Emits a {Redeem} event.
    ///
    /// Requirements:
    ///
    /// - Can only be called after maturation.
    /// - The amount of underlying to redeem cannot be zero.
    /// - There must be enough liquidity in the contract.
    ///
    /// @param underlyingAmount The amount of underlying to redeem.
    function redeem(uint256 underlyingAmount) external;

    /// @notice Updates the BalanceSheet contract this HToken is connected to.
    ///
    /// @dev Throws a {SetBalanceSheet} event.
    ///
    /// Requirements:
    /// - The caller must be the owner.
    ///
    /// @param newBalanceSheet The address of the new BalanceSheet contract.
    function _setBalanceSheet(IBalanceSheetV2 newBalanceSheet) external;

    /// @notice Withdraws underlying in exchange for hTokens.
    ///
    /// @dev Emits a {WithdrawUnderlying} event.
    ///
    /// Requirements:
    ///
    /// - The underlying amount to withdraw cannot be zero.
    /// - Can only be called before maturation.
    ///
    /// @param underlyingAmount The amount of underlying to withdraw.
    function withdrawUnderlying(uint256 underlyingAmount) external;
}
