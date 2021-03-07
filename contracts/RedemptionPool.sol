/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";
import "@paulrberg/contracts/token/erc20/Erc20Recover.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@paulrberg/contracts/utils/ReentrancyGuard.sol";

import "./FintrollerInterface.sol";
import "./RedemptionPoolInterface.sol";

/// @title RedemptionPool
/// @author Hifi
/// @notice Mints 1 fyToken in exhchange for 1 underlying before maturation and burns 1 fyToken
/// in exchange for 1 underlying after maturation.
/// @dev Instantiated by the fyToken in its constructor.
contract RedemptionPool is
    ReentrancyGuard, /// no dependency
    RedemptionPoolInterface, /// one dependency
    Admin, /// two dependencies
    Erc20Recover /// five dependencies
{
    using SafeErc20 for Erc20Interface;

    /// @param fintroller_ The address of the Fintroller contract.
    /// @param fyToken_ The address of the fyToken contract.
    constructor(FintrollerInterface fintroller_, FyTokenInterface fyToken_) Admin() {
        // Set the Fintroller contract and sanity check it.
        fintroller = fintroller_;
        fintroller.isFintroller();

        // Set the fyToken contract. It cannot be sanity-checked because the fyToken creates this
        // contract in its own constructor and contracts cannot be called while initializing.
        fyToken = fyToken_;
    }

    /// @inheritdoc RedemptionPoolInterface
    function redeemFyTokens(uint256 fyTokenAmount) external override nonReentrant returns (bool) {
        // Checks: maturation time.
        require(block.timestamp >= fyToken.expirationTime(), "ERR_BOND_NOT_MATURED");

        // Checks: the zero edge case.
        require(fyTokenAmount > 0, "ERR_REDEEM_FYTOKENS_ZERO");

        // Checks: the Fintroller allows this action to be performed.
        require(fintroller.getRedeemFyTokensAllowed(fyToken), "ERR_REDEEM_FYTOKENS_NOT_ALLOWED");

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
        require(underlyingAmount <= totalUnderlyingSupply, "ERR_REDEEM_FYTOKENS_INSUFFICIENT_UNDERLYING");

        // Effects: decrease the remaining supply of underlying.
        totalUnderlyingSupply -= underlyingAmount;

        // Interactions: burn the fyTokens.
        require(fyToken.burn(msg.sender, fyTokenAmount), "ERR_SUPPLY_UNDERLYING_CALL_BURN");

        // Interactions: perform the Erc20 transfer.
        fyToken.underlying().safeTransfer(msg.sender, underlyingAmount);

        emit RedeemFyTokens(msg.sender, fyTokenAmount, underlyingAmount);

        return true;
    }

    /// @inheritdoc RedemptionPoolInterface
    function supplyUnderlying(uint256 underlyingAmount) external override nonReentrant returns (bool) {
        // Checks: maturation time.
        require(block.timestamp < fyToken.expirationTime(), "ERR_BOND_MATURED");

        // Checks: the zero edge case.
        require(underlyingAmount > 0, "ERR_SUPPLY_UNDERLYING_ZERO");

        // Checks: the Fintroller allows this action to be performed.
        require(fintroller.getSupplyUnderlyingAllowed(fyToken), "ERR_SUPPLY_UNDERLYING_NOT_ALLOWED");

        // Effects: update storage.
        totalUnderlyingSupply += underlyingAmount;

        // fyTokens always have 18 decimals so the underlying amount needs to be upscaled. If the
        // precision scalar is 1, it means that the underlying also has 18 decimals.
        uint256 underlyingPrecisionScalar = fyToken.underlyingPrecisionScalar();
        uint256 fyTokenAmount;
        if (underlyingPrecisionScalar != 1) {
            fyTokenAmount = underlyingAmount * underlyingPrecisionScalar;
        } else {
            fyTokenAmount = underlyingAmount;
        }

        // Interactions: mint the fyTokens.
        require(fyToken.mint(msg.sender, fyTokenAmount), "ERR_SUPPLY_UNDERLYING_CALL_MINT");

        // Interactions: perform the Erc20 transfer.
        fyToken.underlying().safeTransferFrom(msg.sender, address(this), underlyingAmount);

        emit SupplyUnderlying(msg.sender, underlyingAmount, fyTokenAmount);

        return true;
    }
}
