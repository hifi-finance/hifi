/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./RedemptionPoolInterface.sol";
import "./math/CarefulMath.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";

/**
 * @title RedemptionPoolInterface
 * @author Mainframe
 */
contract RedemptionPool is RedemptionPoolInterface, Admin, CarefulMath, ErrorReporter {
    constructor(YTokenInterface yToken_) public Admin() {
        /* Sanity check. */
        yToken_.isYToken();
        yToken = yToken_;
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

        /* Effects: update the redeemable underlying total supply in storage. */
        (vars.mathErr, vars.newUnderlyingTotalSupply) = addUInt(underlyingTotalSupply, underlyingAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_SUPPLY_UNDERLYING_MATH_ERROR");
        underlyingTotalSupply = vars.newUnderlyingTotalSupply;

        /* Interactions: mint the yTokens. */
        require(yToken.mint(msg.sender, underlyingAmount), "ERR_SUPPLY_UNDERLYING_YTOKEN_MINT");

        /* Interactions: deposit the underlying */
        require(
            yToken.underlying().transferFrom(msg.sender, address(this), underlyingAmount),
            "ERR_SUPPLY_UNDERLYING_ERC20_TRANSFER"
        );

        emit SupplyUnderlying(msg.sender, underlyingAmount);

        return NO_ERROR;
    }
}
