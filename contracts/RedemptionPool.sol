/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/Erc20Recover.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@paulrberg/contracts/utils/ReentrancyGuard.sol";

import "./IRedemptionPool.sol";
import "./IFintroller.sol";
import "./IFyToken.sol";

/// @title RedemptionPool
/// @author Hifi
/// @notice Mints 1 fyToken in exhchange for 1 underlying before maturation and burns 1 fyToken in exchange
/// for 1 underlying after maturation.
/// @dev Instantiated by the fyToken in its constructor.
contract RedemptionPool is
    ReentrancyGuard, /// no dependency
    Admin, /// one dependency
    IRedemptionPool, /// one dependency
    Erc20Recover /// five dependencies
{
    using SafeErc20 for IErc20;

    /// STORAGE PROPERTIES ///

    /// @inheritdoc IRedemptionPool
    IFintroller public override fintroller;

    /// @inheritdoc IRedemptionPool
    IFyToken public override fyToken;

    /// @inheritdoc IRedemptionPool
    bool public constant override isRedemptionPool = true;

    /// @inheritdoc IRedemptionPool
    uint256 public override totalUnderlyingSupply;

    /// @param fintroller_ The address of the Fintroller contract.
    /// @param fyToken_ The address of the fyToken contract.
    constructor(IFintroller fintroller_, IFyToken fyToken_) Admin() {
        // Set the Fintroller contract and sanity check it.
        fintroller = fintroller_;
        fintroller.isFintroller();

        // Set the fyToken contract. It cannot be sanity-checked because the fyToken creates this contract in
        // its own constructor and contracts cannot be called while initializing.
        fyToken = fyToken_;
    }

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IRedemptionPool
    function redeemFyTokens(uint256 fyTokenAmount) external override nonReentrant {
        // Checks: maturation time.
        require(block.timestamp >= fyToken.expirationTime(), "BOND_NOT_MATURED");

        // Checks: the zero edge case.
        require(fyTokenAmount > 0, "REDEEM_FYTOKENS_ZERO");

        // Checks: the Fintroller allows this action to be performed.
        require(fintroller.getRedeemFyTokensAllowed(fyToken), "REDEEM_FYTOKENS_NOT_ALLOWED");

        // fyTokens always have 18 decimals so the underlying amount needs to be downscaled.
        // If the precision scalar is 1, it means that the underlying also has 18 decimals.
        uint256 underlyingPrecisionScalar = fyToken.underlyingPrecisionScalar();
        uint256 underlyingAmount;
        if (underlyingPrecisionScalar != 1) {
            underlyingAmount = fyTokenAmount / underlyingPrecisionScalar;
        } else {
            underlyingAmount = fyTokenAmount;
        }

        // Checks: there is enough liquidity.
        require(underlyingAmount <= totalUnderlyingSupply, "REDEEM_FYTOKENS_INSUFFICIENT_UNDERLYING");

        // Effects: decrease the remaining supply of underlying.
        totalUnderlyingSupply -= underlyingAmount;

        // Interactions: burn the fyTokens.
        fyToken.burn(msg.sender, fyTokenAmount);

        // Interactions: perform the Erc20 transfer.
        fyToken.underlying().safeTransfer(msg.sender, underlyingAmount);

        emit RedeemFyTokens(msg.sender, fyTokenAmount, underlyingAmount);
    }

    /// @inheritdoc IRedemptionPool
    function supplyUnderlying(uint256 underlyingAmount) external override nonReentrant {
        // Checks: maturation time.
        require(block.timestamp < fyToken.expirationTime(), "BOND_MATURED");

        // Checks: the zero edge case.
        require(underlyingAmount > 0, "SUPPLY_UNDERLYING_ZERO");

        // Checks: the Fintroller allows this action to be performed.
        require(fintroller.getSupplyUnderlyingAllowed(fyToken), "SUPPLY_UNDERLYING_NOT_ALLOWED");

        // Effects: update storage.
        totalUnderlyingSupply += underlyingAmount;

        // fyTokens always have 18 decimals so the underlying amount needs to be upscaled. If the precision scalar
        // is 1, it means that the underlying also 18 decimals too.
        uint256 underlyingPrecisionScalar = fyToken.underlyingPrecisionScalar();
        uint256 fyTokenAmount;
        if (underlyingPrecisionScalar != 1) {
            fyTokenAmount = underlyingAmount * underlyingPrecisionScalar;
        } else {
            fyTokenAmount = underlyingAmount;
        }

        // Interactions: mint the fyTokens.
        fyToken.mint(msg.sender, fyTokenAmount);

        // Interactions: perform the Erc20 transfer.
        fyToken.underlying().safeTransferFrom(msg.sender, address(this), underlyingAmount);

        emit SupplyUnderlying(msg.sender, underlyingAmount, fyTokenAmount);
    }
}
