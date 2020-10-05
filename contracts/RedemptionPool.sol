/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./FintrollerInterface.sol";
import "./RedemptionPoolInterface.sol";
import "./erc20/Erc20Interface.sol";
import "./erc20/Erc20Recover.sol";
import "./erc20/SafeErc20.sol";
import "./math/CarefulMath.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title RedemptionPool
 * @author Mainframe
 */
contract RedemptionPool is
    ErrorReporter, /* no dependency */
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

        /* Set the yToken contract and sanity check it. */
        yToken = yToken_;
        yToken.isYToken();
    }

    struct RedeemUnderlyingLocalVars {
        MathError mathErr;
        uint256 newUnderlyingTotalSupply;
        uint256 underlyingPrecisionScalar;
        uint256 yTokenAmount;
    }

    /**
     * @notice Pays the token holder the face value at maturation time.
     *
     * @dev Emits a {RedeemUnderlying} event.
     *
     * Requirements:
     *
     * - Must be called post maturation.
     * - The amount to redeem cannot be zero.
     * - The Fintroller must allow this action to be performed.
     * - There must be enough liquidity in the Redemption Pool.
     *
     * @param underlyingAmount The amount of yTokens to redeem for the underlying asset.
     * @return bool=success, otherwise it reverts.
     */
    function redeemUnderlying(uint256 underlyingAmount) external override nonReentrant returns (bool) {
        RedeemUnderlyingLocalVars memory vars;

        /* Checks: maturation time. */
        require(block.timestamp >= yToken.expirationTime(), "ERR_BOND_NOT_MATURED");

        /* Checks: the zero edge case. */
        require(underlyingAmount > 0, "ERR_REDEEM_UNDERLYING_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.getRedeemUnderlyingAllowed(yToken), "ERR_REDEEM_UNDERLYING_NOT_ALLOWED");

        /* Checks: there is sufficient liquidity. */
        require(underlyingAmount <= totalUnderlyingSupply, "ERR_REDEEM_UNDERLYING_INSUFFICIENT_UNDERLYING");

        /* Effects: decrease the remaining supply of underlying. */
        (vars.mathErr, vars.newUnderlyingTotalSupply) = subUInt(totalUnderlyingSupply, underlyingAmount);
        assert(vars.mathErr == MathError.NO_ERROR);
        totalUnderlyingSupply = vars.newUnderlyingTotalSupply;

        /**
         * yTokens always have 18 decimals so we have to upscale the underlying amount.
         * If the precision scalar is 1, it means that the underlying also has 18 decimals.
         */
        vars.underlyingPrecisionScalar = yToken.underlyingPrecisionScalar();
        if (vars.underlyingPrecisionScalar != 1) {
            (vars.mathErr, vars.yTokenAmount) = mulUInt(underlyingAmount, vars.underlyingPrecisionScalar);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_REDEEM_UNDERLYING_MATH_ERROR");
        } else {
            vars.yTokenAmount = underlyingAmount;
        }

        /* Interactions: burn the yTokens. */
        require(yToken.burn(msg.sender, underlyingAmount), "ERR_REDEEM_UNDERLYING_BURN");

        /* Interactions: perform the Erc20 transfer. */
        yToken.underlying().safeTransfer(msg.sender, underlyingAmount);

        emit RedeemUnderlying(msg.sender, underlyingAmount);

        return NO_ERROR;
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
     * @return bool=success, otherwise it reverts.
     */
    function supplyUnderlying(uint256 underlyingAmount) external override nonReentrant returns (bool) {
        SupplyUnderlyingLocalVars memory vars;

        /* Checks: maturation time. */
        require(block.timestamp < yToken.expirationTime(), "ERR_BOND_MATURED");

        /* Checks: the zero edge case. */
        require(underlyingAmount > 0, "ERR_SUPPLY_UNDERLYING_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.getSupplyUnderlyingAllowed(yToken), "ERR_SUPPLY_UNDERLYING_NOT_ALLOWED");

        /* Effects */
        (vars.mathErr, vars.newUnderlyingTotalSupply) = addUInt(totalUnderlyingSupply, underlyingAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_SUPPLY_UNDERLYING_MATH_ERROR");
        totalUnderlyingSupply = vars.newUnderlyingTotalSupply;

        /**
         * yTokens always have 18 decimals so we have to upscale the underlying amount.
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
        require(yToken.mint(msg.sender, vars.yTokenAmount), "ERR_SUPPLY_UNDERLYING_MINT");

        /* Interactions: perform the Erc20 transfer. */
        yToken.underlying().safeTransferFrom(msg.sender, address(this), underlyingAmount);

        emit SupplyUnderlying(msg.sender, underlyingAmount);

        return NO_ERROR;
    }
}
