/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/Erc20Recover.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@paulrberg/contracts/utils/ReentrancyGuard.sol";

import "./IRedemptionPool.sol";
import "./IFintroller.sol";
import "./IHToken.sol";

/// @title RedemptionPool
/// @author Hifi
/// @notice Mints 1 hToken in exhchange for 1 underlying before maturation and burns 1 hToken in exchange
/// for 1 underlying after maturation.
/// @dev Instantiated by the hToken in its constructor.
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
    IHToken public override hToken;

    /// @inheritdoc IRedemptionPool
    bool public constant override isRedemptionPool = true;

    /// @inheritdoc IRedemptionPool
    uint256 public override totalUnderlyingSupply;

    /// @param fintroller_ The address of the Fintroller contract.
    /// @param hToken_ The address of the hToken contract.
    constructor(IFintroller fintroller_, IHToken hToken_) Admin() {
        // Set the Fintroller contract and sanity check it.
        fintroller = fintroller_;
        fintroller.isFintroller();

        // Set the hToken contract. It cannot be sanity-checked because the hToken creates this contract in
        // its own constructor and contracts cannot be called while initializing.
        hToken = hToken_;
    }

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IRedemptionPool
    function redeemHTokens(uint256 hTokenAmount) external override nonReentrant {
        // Checks: maturation time.
        require(block.timestamp >= hToken.expirationTime(), "BOND_NOT_MATURED");

        // Checks: the zero edge case.
        require(hTokenAmount > 0, "REDEEM_HTOKENS_ZERO");

        // Checks: the Fintroller allows this action to be performed.
        require(fintroller.getRedeemHTokensAllowed(hToken), "REDEEM_HTOKENS_NOT_ALLOWED");

        // hTokens always have 18 decimals so the underlying amount needs to be denormalized.
        // If the precision scalar is 1, it means that the underlying also has 18 decimals.
        uint256 underlyingPrecisionScalar = hToken.underlyingPrecisionScalar();
        uint256 underlyingAmount;
        if (underlyingPrecisionScalar != 1) {
            underlyingAmount = hTokenAmount / underlyingPrecisionScalar;
        } else {
            underlyingAmount = hTokenAmount;
        }

        // Checks: there is enough liquidity.
        require(underlyingAmount <= totalUnderlyingSupply, "REDEEM_HTOKENS_INSUFFICIENT_UNDERLYING");

        // Effects: decrease the remaining supply of underlying.
        totalUnderlyingSupply -= underlyingAmount;

        // Interactions: burn the hTokens.
        hToken.burn(msg.sender, hTokenAmount);

        // Interactions: perform the Erc20 transfer.
        hToken.underlying().safeTransfer(msg.sender, underlyingAmount);

        emit RedeemHTokens(msg.sender, hTokenAmount, underlyingAmount);
    }

    /// @inheritdoc IRedemptionPool
    function supplyUnderlying(uint256 underlyingAmount) external override nonReentrant {
        // Checks: maturation time.
        require(block.timestamp < hToken.expirationTime(), "BOND_MATURED");

        // Checks: the zero edge case.
        require(underlyingAmount > 0, "SUPPLY_UNDERLYING_ZERO");

        // Checks: the Fintroller allows this action to be performed.
        require(fintroller.getSupplyUnderlyingAllowed(hToken), "SUPPLY_UNDERLYING_NOT_ALLOWED");

        // Effects: update storage.
        totalUnderlyingSupply += underlyingAmount;

        // hTokens always have 18 decimals so the underlying amount needs to be normalized. If the precision scalar
        // is 1, it means that the underlying has 18 decimals too.
        uint256 underlyingPrecisionScalar = hToken.underlyingPrecisionScalar();
        uint256 hTokenAmount;
        if (underlyingPrecisionScalar != 1) {
            hTokenAmount = underlyingAmount * underlyingPrecisionScalar;
        } else {
            hTokenAmount = underlyingAmount;
        }

        // Interactions: mint the hTokens.
        hToken.mint(msg.sender, hTokenAmount);

        // Interactions: perform the Erc20 transfer.
        hToken.underlying().safeTransferFrom(msg.sender, address(this), underlyingAmount);

        emit SupplyUnderlying(msg.sender, underlyingAmount, hTokenAmount);
    }
}
