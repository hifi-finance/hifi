/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./GuarantorPoolInterface.sol";
import "./erc20/Erc20.sol";
import "./erc20/Erc20Interface.sol";
import "./erc20/SafeErc20.sol";
import "./math/Exponential.sol";
import "./oracles/UniswapAnchoredViewInterface.sol";
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
        uint8 defaultNumberOfDecimals = 18;

        /* Set the Fintroller contract and sanity check it. */
        fintroller = fintroller_;
        fintroller.isFintroller();

        /* Set the yToken contract and sanity check it. */
        yToken = yToken_;
        yToken.isYToken();

        /* Set the guaranty contract and calculate the decimals scalar offset. */
        guaranty = guaranty_;
        require(defaultNumberOfDecimals >= guaranty.decimals(), "ERR_CONSTRUCTOR_GUARANTY_DECIMALS_OVERFLOW");
        guarantyPrecisionScalar = 1**(defaultNumberOfDecimals / guaranty.decimals());
    }

    /**
     * CONSTANT FUNCTIONS
     */

    struct GetSharesForNewDeposit {
        MathError mathErr;
        uint256 collateralPriceFromOracle;
        uint256 collateralPriceUpscaled;
        uint256 guarantyAmountUpscaled;
        Exp guarantyValueUsd;
        Exp guarantyValueUsdDividedByTotalStartingValueUsd;
        uint256 guarantyPriceFromOracle;
        uint256 guarantyPriceUpscaled;
        Exp sharesToMint;
        uint256 totalClutchedCollateralUpscaled;
        Exp totalClutchedCollateralValueUsd;
        uint256 totalGuarantyUpscaled;
        Exp totalGuarantyValueUsd;
        Exp totalStartingValueUsd;
    }

    /**
     * @notice Calculates the number of new shares to mint when an account deposits guaranty.
     * @dev The formula applied is: `sMinted = sStarting * (xDepositedUsd / (xStartingUsd + yStartingUsd))`, where
     * "s" stands for Guarantor Pool shares, "x" for guaranty asset and "y" for clutched collateral.
     *
     * Requirements:
     *
     * - The total guaranty and the total clutched collateral must not be both zero.
     * - The oracle prices must be non-zero.
     *
     * @param guarantyAmountUpscaled The amount of new guaranty tokens to deposit, upscaled to 18 decimals.
     * @return The number of shares as a mantissa.
     */
    function getShares(uint256 guarantyAmountUpscaled) public override view returns (uint256) {
        GetSharesForNewDeposit memory vars;

        /* Avoid the zero edge cases. */
        if (guarantyAmountUpscaled == 0) {
            return 0;
        }
        require(
            totalGuaranty != 0 || totalClutchedCollateral != 0,
            "ERR_GET_SHARES_TOTAL_GUARANTY_CLUTCHED_COLLATERAL_ZERO"
        );

        /* Grab the collateral's USD price from the oracle. */
        UniswapAnchoredViewInterface oracle = fintroller.oracle();
        vars.collateralPriceFromOracle = oracle.price(yToken.collateral().symbol());
        require(vars.collateralPriceFromOracle > 0, "ERR_COLLATERAL_PRICE_ZERO");

        /* Upscale the 6 decimal oracle price to mantissa precision. */
        (vars.mathErr, vars.collateralPriceUpscaled) = mulUInt(
            vars.collateralPriceFromOracle,
            fintroller.oraclePricePrecisionScalar()
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_SHARES_MATH_ERROR");

        /* Grab the guaranty's USD price from the oracle. */
        vars.guarantyPriceFromOracle = oracle.price(guaranty.symbol());
        require(vars.guarantyPriceFromOracle > 0, "ERR_GUARANTY_PRICE_ZERO");

        /* Upscale the 6 decimal oracle price to mantissa precision. */
        (vars.mathErr, vars.guarantyPriceUpscaled) = mulUInt(
            vars.guarantyPriceFromOracle,
            fintroller.oraclePricePrecisionScalar()
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_SHARES_MATH_ERROR");

        /* Calculate the USD value of the guaranty. */
        (vars.mathErr, vars.guarantyValueUsd) = mulExp(
            Exp({ mantissa: guarantyAmountUpscaled }),
            Exp({ mantissa: vars.guarantyPriceUpscaled })
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_SHARES_MATH_ERROR");

        /* Upscale the guaranty, which can have any precision, to mantissa precision. */
        if (totalGuaranty > 0) {
            /* If there is no guaranty in the contract, the USD value is zero. */
            (vars.mathErr, vars.totalGuarantyUpscaled) = mulUInt(totalGuaranty, guarantyPrecisionScalar);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_SHARES_MATH_ERROR");

            /* Calculate the USD value of the total guaranty. */
            (vars.mathErr, vars.totalGuarantyValueUsd) = mulExp(
                Exp({ mantissa: vars.totalGuarantyUpscaled }),
                Exp({ mantissa: vars.guarantyPriceUpscaled })
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_SHARES_MATH_ERROR");
        }

        /* If there is no clutched collateral in the contract, the USD value is zero. */
        if (totalClutchedCollateral > 0) {
            /* Upscale the collateral, which can have any precision, to mantissa precision. */
            (vars.mathErr, vars.totalClutchedCollateralUpscaled) = mulUInt(
                totalClutchedCollateral,
                yToken.collateralPrecisionScalar()
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_SHARES_MATH_ERROR");

            /* Calculate the USD value of the total clutched collateral. */
            (vars.mathErr, vars.totalClutchedCollateralValueUsd) = mulExp(
                Exp({ mantissa: vars.totalClutchedCollateralUpscaled }),
                Exp({ mantissa: vars.collateralPriceUpscaled })
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_SHARES_MATH_ERROR");
        }

        /* Calculate the total starting USD value. */
        (vars.mathErr, vars.totalStartingValueUsd) = addExp(
            vars.totalGuarantyValueUsd,
            vars.totalClutchedCollateralValueUsd
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_SHARES_MATH_ERROR");

        /* Implementation of (xDepositedUsd / (xStartingUsd + yStartingUsd)). */
        (vars.mathErr, vars.guarantyValueUsdDividedByTotalStartingValueUsd) = divExp(
            vars.guarantyValueUsd,
            vars.totalStartingValueUsd
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_SHARES_MATH_ERROR");

        /* Finally calculate how many shares to mint. */
        (vars.mathErr, vars.sharesToMint) = mulExp(
            vars.guarantyValueUsdDividedByTotalStartingValueUsd,
            Exp({ mantissa: totalSupply })
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_GET_SHARES_MATH_ERROR");

        return vars.sharesToMint.mantissa;
    }

    /**
     * NON-CONSTANT FUNCTIONS
     */

    struct DepositGuarantyLocalVars {
        MathError mathErr;
        uint256 guarantyAmountUpscaled;
        uint256 sharesToMint;
        uint256 newTotalGuaranty;
    }

    /**
     * @notice Deposits tokens as guaranty to the pool. This raises the debt ceiling of the protocol.
     *
     * @dev Emits a {DepositGuaranty} event.
     *
     * Requirements:
     *
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

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.depositGuarantyAllowed(this), "ERR_DEPOSIT_GUARANTY_NOT_ALLOWED");

        /* Upscale the guaranty, which can have any precision, to mantissa precision. */
        (vars.mathErr, vars.guarantyAmountUpscaled) = mulUInt(guarantyAmount, guarantyPrecisionScalar);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_DEPOSIT_GUARANTY_MATH_ERROR");

        /* Calculate the shares to mint. */
        if (totalSupply == 0) {
            /* Interactions: mint the first 1,000 shares to the zero address. */
            (vars.mathErr, vars.sharesToMint) = subUInt(vars.guarantyAmountUpscaled, minimumShares);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_DEPOSIT_GUARANTY_MINIMUM_SHARES_UNDERFLOW");
            mintInternal(address(0x00), minimumShares);
            emit Mint(address(0x00), minimumShares);
        } else {
            /* This happens only when everybody exited the pool. */
            if (totalSupply == 0 && totalClutchedCollateral == 0) {
                vars.sharesToMint = vars.guarantyAmountUpscaled;
            } else {
                vars.sharesToMint = getShares(vars.guarantyAmountUpscaled);
            }
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

    function withdrawGuarantyAndClutchedCollateral(uint256 shareAmount) external override pure returns (bool) {
        shareAmount;
        return true;
    }
}
