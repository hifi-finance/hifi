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
     * @param guaranty_ The address of the Erc20 asset to serve as guaranty.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        FintrollerInterface fintroller_,
        YTokenInterface yToken_,
        Erc20Interface guaranty_
    ) Erc20(name_, symbol_, 18) Admin() {
        /* Set the Fintroller contract and sanity check it. */
        fintroller = fintroller_;
        fintroller.isFintroller();

        /* Set the yToken contract and sanity check it. */
        yToken = yToken_;
        yToken.isYToken();

        /* Set the guaranty asset and sanity check it. */
        guaranty = guaranty_;
        /* TODO: calculate the decimal scalar offset. */
    }

    /**
     * NON-CONSTANT FUNCTIONS
     */

    struct DepositGuarantyLocalVars {
        MathError mathErr;
        Exp guarantyAmountDividedByTotalLiquidity;
        uint256 newTotalGuaranty;
        uint256 sharesToMint;
    }

    /**
     * @notice Deposits assets as guaranty to the pool. This raises the debt ceiling of the protocol.
     *
     * @dev Emits a {DepositGuaranty} event.
     *
     * Requirements:
     * - The amount to deposit cannot be zero.
     * - The Fintroller must allow this action to be performed.
     * - The caller must have allowed this contract to spend `guarantyAmount` guaranty tokens.
     *
     * @param guarantyAmount The amount of `guaranty` to deposit.
     * @return bool=success, otherwise it reverts.
     */
    function depositGuaranty(uint256 guarantyAmount) external override returns (bool) {
        DepositGuarantyLocalVars memory vars;

        /* Checks: avoid the zero edge case. */
        require(guarantyAmount > 0, "ERR_DEPOSIT_GUARANTY_ZERO");

        /* TODO: check that the Fintroller allows this action to be performed. */
        /* TODO: upscale the guaranty amount. */

        /* Calculate the shares to mint. */
        if (totalSupply == 0) {
            /* Interactions: mint the first 1,000 shares to the zero address. */
            (vars.mathErr, vars.sharesToMint) = subUInt(guarantyAmount, minimumShares);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_DEPOSIT_GUARANTY_MINIMUM_SHARES_UNDERFLOW");
            mintInternal(address(0x00), minimumShares);
            emit Mint(address(0x00), minimumShares);
        } else {
            /**
             * The formula applied in this code block is:
             * sMinted = xDeposited / xStarting * sStarting
             * Where "s" stands Guarantor Pool shares and "x" for the Erc20 guaranty asset.
             */
            (vars.mathErr, vars.guarantyAmountDividedByTotalLiquidity) = divExp(
                Exp({ mantissa: guarantyAmount }),
                Exp({ mantissa: totalGuaranty })
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_DEPOSIT_GUARANTY_MATH_ERROR");

            Exp memory sharesToMintExp;
            (vars.mathErr, sharesToMintExp) = mulExp(
                vars.guarantyAmountDividedByTotalLiquidity,
                Exp({ mantissa: totalSupply })
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_DEPOSIT_GUARANTY_MATH_ERROR");

            vars.sharesToMint = sharesToMintExp.mantissa;
        }

        /* Effects: mint the shares and increase the total supply. */
        mintInternal(msg.sender, vars.sharesToMint);

        /* Effects: increase the total guaranty. */
        (vars.mathErr, vars.newTotalGuaranty) = addUInt(totalGuaranty, guarantyAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_DEPOSIT_GUARANTY_MATH_ERROR");
        totalGuaranty = vars.newTotalGuaranty;

        /* Interactions: perform the Erc20 transfer. */
        guaranty.safeTransferFrom(msg.sender, address(this), guarantyAmount);

        emit DepositGuaranty(msg.sender, guarantyAmount);
        emit Mint(msg.sender, vars.sharesToMint);

        return NO_ERROR;
    }
}
