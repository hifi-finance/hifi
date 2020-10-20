/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/math/CarefulMath.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";
import "@paulrberg/contracts/token/erc20/Erc20Recover.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";

import "./FintrollerInterface.sol";
import "./RedemptionPoolInterface.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title RedemptionPool
 * @author Mainframe
 */
contract RedemptionPool is
    CarefulMath, /* no dependency */
    ReentrancyGuard, /* no dependency */
    RedemptionPoolInterface, /* one dependency */
    Admin, /* two dependencies */
    Erc20Recover /* five dependencies */
{
    using SafeErc20 for Erc20Interface;

    /**
     * @param fintroller_ The address of the Fintroller contract.
     * @param yToken_ The address of the yToken contract.
     */
    constructor(FintrollerInterface fintroller_, YTokenInterface yToken_) Admin() {
        /* Set the Fintroller contract and sanity check it. */
        fintroller = fintroller_;
        fintroller.isFintroller();

        /**
         * Set the yToken contract. It cannot be sanity-checked because the yToken creates this
         * contract in its own constructor and contracts cannot be called while initializing.
         */
        yToken = yToken_;
    }

    struct RedeemYTokensLocalVars {
        MathError mathErr;
        uint256 newUnderlyingTotalSupply;
        uint256 underlyingPrecisionScalar;
        uint256 underlyingAmount;
    }

    /**
     * @notice Pays the token holder the face value at maturation time.
     *
     * @dev Emits a {RedeemYTokens} event.
     *
     * Requirements:
     *
     * - Must be called post maturation.
     * - The amount to redeem cannot be zero.
     * - The Fintroller must allow this action to be performed.
     * - There must be enough liquidity in the Redemption Pool.
     *
     * @param yTokenAmount The amount of yTokens to redeem for the underlying asset.
     * @return true = success, otherwise it reverts.
     */
    function redeemYTokens(uint256 yTokenAmount) external override nonReentrant returns (bool) {
        RedeemYTokensLocalVars memory vars;

        /* Checks: maturation time. */
        require(block.timestamp >= yToken.expirationTime(), "ERR_BOND_NOT_MATURED");

        /* Checks: the zero edge case. */
        require(yTokenAmount > 0, "ERR_REDEEM_YTOKENS_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.getRedeemYTokensAllowed(yToken), "ERR_REDEEM_YTOKENS_NOT_ALLOWED");

        /* Checks: there is enough liquidity. */
        require(yTokenAmount <= totalUnderlyingSupply, "ERR_REDEEM_YTOKENS_INSUFFICIENT_UNDERLYING");

        /**
         * yTokens always have 18 decimals so the underlying amount needs to be downscaled.
         * If the precision scalar is 1, it means that the underlying also has 18 decimals.
         */
        vars.underlyingPrecisionScalar = yToken.underlyingPrecisionScalar();
        if (vars.underlyingPrecisionScalar != 1) {
            (vars.mathErr, vars.underlyingAmount) = divUInt(yTokenAmount, vars.underlyingPrecisionScalar);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_REDEEM_YTOKENS_MATH_ERROR");
        } else {
            vars.underlyingAmount = yTokenAmount;
        }

        /* Effects: decrease the remaining supply of underlying. */
        (vars.mathErr, vars.newUnderlyingTotalSupply) = subUInt(totalUnderlyingSupply, vars.underlyingAmount);
        assert(vars.mathErr == MathError.NO_ERROR);
        totalUnderlyingSupply = vars.newUnderlyingTotalSupply;

        /* Interactions: burn the yTokens. */
        require(yToken.burn(msg.sender, yTokenAmount), "ERR_SUPPLY_UNDERLYING_CALL_BURN");

        /* Interactions: perform the Erc20 transfer. */
        yToken.underlying().safeTransfer(msg.sender, vars.underlyingAmount);

        emit RedeemYTokens(msg.sender, yTokenAmount, vars.underlyingAmount);

        return true;
    }

    struct SupplyUnderlyingLocalVars {
        MathError mathErr;
        uint256 newUnderlyingTotalSupply;
        uint256 underlyingPrecisionScalar;
        uint256 yTokenAmount;
    }

    /**
     * @notice An alternative to the usual minting method that does not involve taking on debt.
     *
     * @dev Emits a {SupplyUnderlying} event.
     *
     * Requirements:
     *
     * - Must be called prior to maturation.
     * - The amount to supply cannot be zero.
     * - The Fintroller must allow this action to be performed.
     * - The caller must have allowed this contract to spend `underlyingAmount` tokens.
     *
     * @param underlyingAmount The amount of underlying to supply to the Redemption Pool.
     * @return true = success, otherwise it reverts.
     */
    function supplyUnderlying(uint256 underlyingAmount) external override nonReentrant returns (bool) {
        SupplyUnderlyingLocalVars memory vars;

        /* Checks: maturation time. */
        require(block.timestamp < yToken.expirationTime(), "ERR_BOND_MATURED");

        /* Checks: the zero edge case. */
        require(underlyingAmount > 0, "ERR_SUPPLY_UNDERLYING_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.getSupplyUnderlyingAllowed(yToken), "ERR_SUPPLY_UNDERLYING_NOT_ALLOWED");

        /* Effects: update storage. */
        (vars.mathErr, vars.newUnderlyingTotalSupply) = addUInt(totalUnderlyingSupply, underlyingAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_SUPPLY_UNDERLYING_MATH_ERROR");
        totalUnderlyingSupply = vars.newUnderlyingTotalSupply;

        /**
         * yTokens always have 18 decimals so the underlying amount needs to be upscaled.
         * If the precision scalar is 1, it means that the underlying also has 18 decimals.
         */
        vars.underlyingPrecisionScalar = yToken.underlyingPrecisionScalar();
        if (vars.underlyingPrecisionScalar != 1) {
            (vars.mathErr, vars.yTokenAmount) = mulUInt(underlyingAmount, vars.underlyingPrecisionScalar);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_SUPPLY_UNDERLYING_MATH_ERROR");
        } else {
            vars.yTokenAmount = underlyingAmount;
        }

        /* Interactions: mint the yTokens. */
        require(yToken.mint(msg.sender, vars.yTokenAmount), "ERR_SUPPLY_UNDERLYING_CALL_MINT");

        /* Interactions: perform the Erc20 transfer. */
        yToken.underlying().safeTransferFrom(msg.sender, address(this), underlyingAmount);

        emit SupplyUnderlying(msg.sender, underlyingAmount, vars.yTokenAmount);

        return true;
    }
}
