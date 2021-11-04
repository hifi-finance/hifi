// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/balanceSheet/SBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";

import "./HifiFlashUniswapV2Utils.sol";
import "./IHifiFlashUniswapV2Underlying.sol";
import "./IUniswapV2Pair.sol";

/// @notice Emitted when the caller is not the Uniswap V2 pair contract.
error HifiFlashUniswapV2Underlying__CallNotAuthorized(address caller);

/// @notice Emitted when the flash borrowed asset is the wrong token in the pair.
error HifiFlashUniswapV2Underlying__FlashBorrowWrongToken(uint256 collateralAmount);

/// @notice Emitted when neither the token0 nor the token1 is the underlying.
error HifiFlashUniswapV2Underlying__UnderlyingNotInPool(
    IUniswapV2Pair pair,
    address token0,
    address token1,
    IErc20 underlying
);

/// @title HifiFlashUniswapV2Underlying
/// @author Hifi
contract HifiFlashUniswapV2Underlying is IHifiFlashUniswapV2Underlying {
    using SafeErc20 for IErc20;

    /// PUBLIC STORAGE ///

    /// @inheritdoc IHifiFlashUniswapV2Underlying
    IBalanceSheetV1 public override balanceSheet;

    /// @inheritdoc IHifiFlashUniswapV2Underlying
    address public override uniV2Factory;

    /// @inheritdoc IHifiFlashUniswapV2Underlying
    bytes32 public override uniV2PairInitCodeHash;

    /// CONSTRUCTOR ///
    constructor(
        IBalanceSheetV1 balanceSheet_,
        address uniV2Factory_,
        bytes32 uniV2PairInitCodeHash_
    ) {
        balanceSheet = IBalanceSheetV1(balanceSheet_);
        uniV2Factory = uniV2Factory_;
        uniV2PairInitCodeHash = uniV2PairInitCodeHash_;
    }

    /// PUBLIC CONSTANT FUNCTIONS ////

    /// @inheritdoc IHifiFlashUniswapV2Underlying
    function getCollateralAndUnderlyingAmount(
        IUniswapV2Pair pair,
        uint256 amount0,
        uint256 amount1,
        IErc20 underlying
    ) public view override returns (IErc20 collateral, uint256 underlyingAmount) {
        address token0 = pair.token0();
        address token1 = pair.token1();
        if (token0 == address(underlying)) {
            if (amount1 > 0) {
                revert HifiFlashUniswapV2Underlying__FlashBorrowWrongToken(amount1);
            }
            collateral = IErc20(token0);
            underlyingAmount = amount0;
        } else if (token1 == address(underlying)) {
            if (amount0 > 0) {
                revert HifiFlashUniswapV2Underlying__FlashBorrowWrongToken(amount0);
            }
            collateral = IErc20(token1);
            underlyingAmount = amount1;
        } else {
            revert HifiFlashUniswapV2Underlying__UnderlyingNotInPool(pair, token0, token1, underlying);
        }
    }

    /// @inheritdoc IHifiFlashUniswapV2Underlying
    function getRepayCollateralAmount(uint256 underlyingAmount)
        public
        pure
        override
        returns (uint256 repayCollateralAmount)
    {
        // Note that we can safely use unchecked arithmetic here because the UniswapV2Pair.sol contract performs
        // sanity checks on the amounts before calling the current contract.
        unchecked {
            uint256 numerator = underlyingAmount * 1000;
            uint256 denominator = 997;
            repayCollateralAmount = numerator / denominator + 1;
        }
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    struct UniswapV2CallLocalVars {
        IHToken bond;
        address bot;
        address borrower;
        IErc20 collateral;
        uint256 mintedHTokenAmount;
        uint256 overshootCollateralAmount;
        uint256 repayCollateralAmount;
        uint256 seizedCollateralAmount;
        address swapToken;
        IErc20 underlying;
        uint256 underlyingAmount;
    }

    /// @inheritdoc IUniswapV2Callee
    function uniswapV2Call(
        address sender,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external override {
        UniswapV2CallLocalVars memory vars;

        // Unpack the ABI encoded data passed by the UniswapV2Pair contract.
        (vars.borrower, vars.bond, vars.bot) = abi.decode(data, (address, IHToken, address));

        // Figure out which token is the collateral and which token is the underlying.
        vars.underlying = vars.bond.underlying();
        (vars.collateral, vars.underlyingAmount) = getCollateralAndUnderlyingAmount(
            IUniswapV2Pair(msg.sender),
            amount0,
            amount1,
            vars.underlying
        );

        vars.swapToken = address(vars.underlying) == IUniswapV2Pair(msg.sender).token0()
            ? IUniswapV2Pair(msg.sender).token1()
            : IUniswapV2Pair(msg.sender).token0();

        // Check that the caller is a genuine UniswapV2Pair contract.
        if (
            msg.sender !=
            HifiFlashUniswapV2Utils.pairFor(
                uniV2Factory,
                uniV2PairInitCodeHash,
                address(vars.underlying),
                vars.swapToken
            )
        ) {
            revert HifiFlashUniswapV2Underlying__CallNotAuthorized(msg.sender);
        }

        // Mint hTokens and liquidate the borrower.
        vars.mintedHTokenAmount = HifiFlashUniswapV2Utils.mintHTokensInternal(vars.bond, vars.underlyingAmount);
        vars.seizedCollateralAmount = HifiFlashUniswapV2Utils.liquidateBorrowInternal(
            balanceSheet,
            vars.borrower,
            vars.bond,
            vars.collateral,
            vars.mintedHTokenAmount
        );

        // Calculate the amount of collateral required to repay.
        vars.repayCollateralAmount = getRepayCollateralAmount(vars.underlyingAmount);

        // The bot wallet compensates for any overshoot of collateral repay amount above seized amount.
        if (vars.repayCollateralAmount > vars.seizedCollateralAmount) {
            unchecked {
                vars.overshootCollateralAmount = vars.repayCollateralAmount - vars.seizedCollateralAmount;
            }
            vars.collateral.safeTransferFrom(vars.bot, address(this), vars.overshootCollateralAmount);
        }

        // Pay back the loan.
        vars.collateral.safeTransfer(msg.sender, vars.repayCollateralAmount);

        // Emit an event.
        emit FlashLiquidateBorrow(
            sender,
            vars.borrower,
            address(vars.bond),
            vars.underlyingAmount,
            vars.seizedCollateralAmount,
            vars.repayCollateralAmount
        );
    }
}
