/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "@nomiclabs/buidler/console.sol";
import "./GuarantorPoolInterface.sol";
import "./erc20/Erc20.sol";
import "./erc20/Erc20Interface.sol";
import "./erc20/SafeErc20.sol";
import "./math/Exponential.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title GuarantorPool
 * @author Mainframe
 */
contract GuarantorPool is GuarantorPoolInterface, Erc20, Admin, ErrorReporter, Exponential, ReentrancyGuard {
    using SafeErc20 for Erc20Interface;

    /**
     * @notice The Guarantor Pool share always has 18 decimals.
     * @param name_ Erc20 name of this token.
     * @param symbol_ Erc20 symbol of this token.
     * @param fintroller_ The address of the Fintroller contract.
     * @param yToken_ The address of the yToken contract.
     * @param asset_ The address of the Erc20 asset to provide liquidity with.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        FintrollerInterface fintroller_,
        YTokenInterface yToken_,
        Erc20Interface asset_
    ) Erc20(name_, symbol_, 18) Admin() {
        /* Set the Fintroller contract and sanity check it. */
        fintroller = fintroller_;
        fintroller.isFintroller();

        /* Set the yToken contract and sanity check it. */
        yToken = yToken_;
        yToken.isYToken();

        /* Set the liquidity asset and sanity check it. */
        asset = asset_;
        /* TODO: calculate the decimal scalar offset. */
    }

    /**
     * NON-CONSTANT FUNCTIONS
     */

    struct AddLiquidityLocalVars {
        MathError mathErr;
        Exp liquidityAmountDividedByTotalLiquidity;
        uint256 newTotalLiquidity;
        uint256 sharesToMint;
    }

    /**
     * @notice Supplies liquidity to the pool. This raises the debt ceiling of the protocol..
     *
     * @dev Emits an {AddLiquidity} event.
     *
     * Requirements:
     * - The amount to supply cannot be zero.
     * - The Fintroller must allow this action to be performed.
     * - The caller must have allowed this contract to spend `liquidityAmount` tokens.
     *
     * @param liquidityAmount The amount of `asset` to supply as liquidity.
     * @return bool=success, otherwise it reverts.
     */
    function addLiquidity(uint256 liquidityAmount) external override returns (bool) {
        AddLiquidityLocalVars memory vars;

        /* Checks: avoid the zero edge case. */
        require(liquidityAmount > 0, "ERR_ADD_LIQUIDITY_ZERO");

        /* TODO: check that the Fintroller allows this action to be performed. */
        /* TODO: upscale the liquidity amount. */

        /* Calculate the shares to mint. */
        if (totalSupply == 0) {
            /* Interactions: mint the first 1,000 shares to the zero address. */
            (vars.mathErr, vars.sharesToMint) = subUInt(liquidityAmount, minimumLiquidity);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_ADD_LIQUIDITY_MINIMUM_LIQUIDITY_UNDERFLOW");
            mintInternal(address(0x00), minimumLiquidity);
            emit Mint(address(0x00), minimumLiquidity);
        } else {
            /**
             * The formula applied in this code block is:
             * sMinted = xDeposited / xStarting * sStarting
             * Where "s" stands for supply of guarantor shares and "x" for supply of liquidity asset.
             */
            (vars.mathErr, vars.liquidityAmountDividedByTotalLiquidity) = divExp(
                Exp({ mantissa: liquidityAmount }),
                Exp({ mantissa: totalLiquidity })
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_ADD_LIQUIDITY_MATH_ERROR");

            Exp memory sharesToMintExp;
            (vars.mathErr, sharesToMintExp) = mulExp(
                vars.liquidityAmountDividedByTotalLiquidity,
                Exp({ mantissa: totalSupply })
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_ADD_LIQUIDITY_MATH_ERROR");

            vars.sharesToMint = sharesToMintExp.mantissa;
        }

        /* Effects: mint the shares and increase the total supply. */
        mintInternal(msg.sender, vars.sharesToMint);

        /* Effects: increase the total liquidity. */
        (vars.mathErr, vars.newTotalLiquidity) = addUInt(totalLiquidity, liquidityAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_ADD_LIQUIDITY_MATH_ERROR");
        totalLiquidity = vars.newTotalLiquidity;

        /* Interactions: perform the Erc20 transfer. */
        asset.safeTransferFrom(msg.sender, address(this), liquidityAmount);

        emit AddLiquidity(msg.sender, liquidityAmount);
        emit Mint(msg.sender, vars.sharesToMint);

        return NO_ERROR;
    }

    function removeLiquidity(uint256 liquidityAmount) external override pure returns (bool) {
        liquidityAmount;
        return NO_ERROR;
    }
}
