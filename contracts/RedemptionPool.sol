/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./FintrollerInterface.sol";
import "./RedemptionPoolInterface.sol";
import "./math/CarefulMath.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";

/**
 * @title RedemptionPool
 * @author Mainframe
 */
contract RedemptionPool is RedemptionPoolInterface, Admin, CarefulMath, ErrorReporter {
    constructor(FintrollerInterface fintroller_, YTokenInterface yToken_) public Admin() {
        /* Set the Fintroller contract and sanity check it. */
        fintroller = fintroller_;
        fintroller.isFintroller();

        /* Set the yToken contract and sanity check it. */
        yToken = yToken_;
        yToken.isYToken();
    }

    struct RedeemLocalVars {
        MathError mathErr;
        uint256 newUnderlyingTotalSupply;
    }

    /**
     * @notice Pays the token holder the face value at maturation time.
     *
     * @dev Emits a {Redeem} event.
     *
     * Requirements:
     * - Must be called post maturation.
     * - The amount to redeem cannot be zero.
     * - There must be enough liquidity in the Redemption Pool.
     *
     * @param redeemAmount The amount of yTokens to redeem for the underlying asset.
     * @return bool=success, otherwise it reverts.
     */
    function redeem(uint256 redeemAmount) external override returns (bool) {
        RedeemLocalVars memory vars;

        /* Checks: maturation time. */
        require(block.timestamp >= yToken.expirationTime(), "ERR_BOND_NOT_MATURED");

        /* Checks: the zero edge case. */
        require(redeemAmount > 0, "ERR_REDEEM_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.redeemAllowed(yToken), "ERR_REDEEM_NOT_ALLOWED");

        /* Checks: there is sufficient liquidity. */
        require(redeemAmount <= underlyingTotalSupply, "ERR_REDEEM_INSUFFICIENT_REDEEMABLE_UNDERLYING");

        /* Effects: decrease the remaining supply of underlying. */
        (vars.mathErr, vars.newUnderlyingTotalSupply) = subUInt(underlyingTotalSupply, redeemAmount);
        assert(vars.mathErr == MathError.NO_ERROR);
        underlyingTotalSupply = vars.newUnderlyingTotalSupply;

        /* Interactions: burn the yTokens. */
        require(yToken.burn(msg.sender, redeemAmount), "ERR_REDEEM_BURN");

        /* Interactions: transfer the underlying */
        require(yToken.underlying().transfer(msg.sender, redeemAmount), "ERR_REDEEM_ERC20_TRANSFER");

        emit Redeem(msg.sender, redeemAmount);

        return NO_ERROR;
    }

    struct SupplyUnderlyingLocalVars {
        MathError mathErr;
        uint256 newUnderlyingTotalSupply;
    }

    /**
     * @notice An alternative to the usual minting method that does not involve taking on debt.
     *
     * @dev Emits a {SupplyUnderlying} event.
     *
     * Requirements:
     * - Must be called before the maturation of the yToken.
     * - The amount to supply cannot be zero.
     * - The caller must have allowed this contract to spend `underlyingAmount` tokens.
     *
     * @param underlyingAmount The amount of underlying to supply to the Redemption Pool.
     * @return bool=success, otherwise it reverts.
     */
    function supplyUnderlying(uint256 underlyingAmount) external override returns (bool) {
        SupplyUnderlyingLocalVars memory vars;

        /* Checks: maturation time. */
        require(block.timestamp < yToken.expirationTime(), "ERR_BOND_MATURED");

        /* Checks: the zero edge case. */
        require(underlyingAmount > 0, "ERR_SUPPLY_UNDERLYING_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.supplyUnderlyingAllowed(yToken), "ERR_SUPPLY_UNDERLYING_NOT_ALLOWED");

        /* Effects: update the redeemable underlying total supply in storage. */
        (vars.mathErr, vars.newUnderlyingTotalSupply) = addUInt(underlyingTotalSupply, underlyingAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_SUPPLY_UNDERLYING_MATH_ERROR");
        underlyingTotalSupply = vars.newUnderlyingTotalSupply;

        /* Interactions: mint the yTokens. */
        require(yToken.mint(msg.sender, underlyingAmount), "ERR_SUPPLY_UNDERLYING_MINT");

        /* Interactions: deposit the underlying */
        require(
            yToken.underlying().transferFrom(msg.sender, address(this), underlyingAmount),
            "ERR_SUPPLY_UNDERLYING_ERC20_TRANSFER"
        );

        emit SupplyUnderlying(msg.sender, underlyingAmount);

        return NO_ERROR;
    }
}
