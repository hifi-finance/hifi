// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/balanceSheet/SBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";

import "./IHifiFlashUniswapV2.sol";
import "./IUniswapV2Pair.sol";

/// @notice Emitted when the caller is not the Uniswap V2 pair contract.
error HifiFlashUniswapV2__CallNotAuthorized(address caller);

/// @notice Emitted when the flash borrowed asset is the collateral instead of the underlying.
error HifiFlashUniswapV2__FlashBorrowCollateral(uint256 collateralAmount);

/// @notice Emitted when the liquidation does not yield a sufficient profit.
error HifiFlashUniswapV2__InsufficientProfit(
    uint256 seizedCollateralAmount,
    uint256 repayCollateralAmount,
    uint256 minProfit
);

/// @notice Emitted when neither the token0 nor the token1 is the underlying.
error HifiFlashUniswapV2__UnderlyingNotInPool(IUniswapV2Pair pair, address token0, address token1, IErc20 underlying);

/// @title HifiFlashUniswapV2
/// @author Hifi
contract HifiFlashUniswapV2 is IHifiFlashUniswapV2 {
    using SafeErc20 for IErc20;

    /// PUBLIC STORAGE ///

    /// @inheritdoc IHifiFlashUniswapV2
    IBalanceSheetV1 public override balanceSheet;

    /// @inheritdoc IHifiFlashUniswapV2
    address public override uniV2Factory;

    /// @inheritdoc IHifiFlashUniswapV2
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

    /// @inheritdoc IHifiFlashUniswapV2
    function getCollateralAndUnderlyingAmount(
        IUniswapV2Pair pair,
        RepayType repayType,
        uint256 amount0,
        uint256 amount1,
        IErc20 underlying
    ) public view override returns (IErc20 collateral, uint256 underlyingAmount) {
        address token0 = pair.token0();
        address token1 = pair.token1();
        if (token0 == address(underlying)) {
            if (amount1 > 0) {
                revert HifiFlashUniswapV2__FlashBorrowCollateral(amount1);
            }
            collateral = IErc20(repayType == RepayType.SINGLE_TOKEN ? token0 : token1);
            underlyingAmount = amount0;
        } else if (token1 == address(underlying)) {
            if (amount0 > 0) {
                revert HifiFlashUniswapV2__FlashBorrowCollateral(amount0);
            }
            collateral = IErc20(repayType == RepayType.SINGLE_TOKEN ? token1 : token0);
            underlyingAmount = amount1;
        } else {
            revert HifiFlashUniswapV2__UnderlyingNotInPool(pair, token0, token1, underlying);
        }
    }

    /// @inheritdoc IHifiFlashUniswapV2
    function getRepayCollateralAmount(
        IUniswapV2Pair pair,
        RepayType repayType,
        IErc20 underlying,
        uint256 underlyingAmount
    ) public view override returns (uint256 repayCollateralAmount) {
        uint256 numerator;
        uint256 denominator;
        if (repayType == RepayType.SINGLE_TOKEN) {
            unchecked {
                numerator = underlyingAmount * 1000;
                denominator = 997;
            }
        } else {
            (uint112 collateralReserves, uint112 underlyingReserves) = getCollateralAndUnderlyingReservesInternal(
                pair,
                underlying
            );
            unchecked {
                numerator = collateralReserves * underlyingAmount * 1000;
                denominator = (underlyingReserves - underlyingAmount) * 997;
            }
        }

        // Note that we can safely use unchecked arithmetic here because the UniswapV2Pair.sol contract performs
        // sanity checks on the amounts before calling the current contract.
        unchecked {
            repayCollateralAmount = numerator / denominator + 1;
        }
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    struct UniswapV2CallLocalVars {
        IHToken bond;
        address borrower;
        IErc20 collateral;
        uint256 minProfit;
        uint256 mintedHTokenAmount;
        uint256 profitCollateralAmount;
        uint256 repayCollateralAmount;
        RepayType repayType;
        uint256 seizedCollateralAmount;
        uint256 swapFeeUnderlyingAmount;
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
        (vars.borrower, vars.bond, vars.minProfit, vars.repayType) = abi.decode(
            data,
            (address, IHToken, uint256, RepayType)
        );

        // Figure out which token is the collateral and which token is the underlying.
        vars.underlying = vars.bond.underlying();
        (vars.collateral, vars.underlyingAmount) = getCollateralAndUnderlyingAmount(
            IUniswapV2Pair(msg.sender),
            vars.repayType,
            amount0,
            amount1,
            vars.underlying
        );

        vars.swapToken = address(vars.underlying) == IUniswapV2Pair(msg.sender).token0()
            ? IUniswapV2Pair(msg.sender).token1()
            : IUniswapV2Pair(msg.sender).token0();

        // Check that the caller is a genuine UniswapV2Pair contract.
        if (msg.sender != pairForInternal(address(vars.underlying), vars.swapToken)) {
            revert HifiFlashUniswapV2__CallNotAuthorized(msg.sender);
        }

        // Mint hTokens and liquidate the borrower.
        vars.mintedHTokenAmount = mintHTokensInternal(vars.bond, vars.underlyingAmount);
        vars.seizedCollateralAmount = liquidateBorrowInternal(
            vars.borrower,
            vars.bond,
            vars.collateral,
            vars.mintedHTokenAmount
        );

        // Calculate the amount of collateral required to repay.
        vars.repayCollateralAmount = getRepayCollateralAmount(
            IUniswapV2Pair(msg.sender),
            vars.repayType,
            vars.underlying,
            vars.underlyingAmount
        );

        if (vars.seizedCollateralAmount > vars.repayCollateralAmount) {
            vars.profitCollateralAmount = vars.seizedCollateralAmount - vars.repayCollateralAmount;
        } else if (address(vars.collateral) != address(vars.underlying)) {
            (uint112 collateralReserves, uint112 underlyingReserves) = getCollateralAndUnderlyingReservesInternal(
                IUniswapV2Pair(msg.sender),
                vars.underlying
            );
            uint256 numerator = (vars.repayCollateralAmount - vars.seizedCollateralAmount) *
                (underlyingReserves - vars.underlyingAmount);
            uint256 denominator = collateralReserves;
            vars.swapFeeUnderlyingAmount = numerator / denominator + 1;
            vars.repayCollateralAmount = vars.seizedCollateralAmount;
        }
        if (vars.profitCollateralAmount < vars.minProfit) {
            revert HifiFlashUniswapV2__InsufficientProfit(
                vars.seizedCollateralAmount,
                vars.repayCollateralAmount,
                vars.minProfit
            );
        }

        // Pay back the loan.
        vars.collateral.safeTransfer(msg.sender, vars.repayCollateralAmount);

        // Reap the profit, if any.
        vars.collateral.safeTransfer(sender, vars.profitCollateralAmount);

        // Emit an event.
        emit FlashLiquidateBorrow(
            sender,
            vars.borrower,
            address(vars.bond),
            vars.underlyingAmount,
            vars.seizedCollateralAmount,
            vars.profitCollateralAmount
        );
    }

    /// INTERNAL CONSTANT FUNCTIONS ///

    /// @dev Returns collateral and underlying token reserves.
    function getCollateralAndUnderlyingReservesInternal(IUniswapV2Pair pair, IErc20 underlying)
        internal
        view
        returns (uint112 collateralReserves, uint112 underlyingReserves)
    {
        // Depending upon which token is which, the reserves are returned in a different order.
        if (pair.token0() == address(underlying)) {
            (underlyingReserves, collateralReserves, ) = pair.getReserves();
        } else {
            (collateralReserves, underlyingReserves, ) = pair.getReserves();
        }
    }

    /// @dev Calculates the CREATE2 address for a pair without making any external calls.
    function pairForInternal(address tokenA, address tokenB) internal view returns (address pair) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        pair = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            hex"ff",
                            uniV2Factory,
                            keccak256(abi.encodePacked(token0, token1)),
                            uniV2PairInitCodeHash
                        )
                    )
                )
            )
        );
    }

    /// INTERNAL NON-CONSTANT FUNCTIONS ///

    /// @dev Liquidates the borrower by transferring the underlying to the BalanceSheet. By doing this, the
    /// liquidator receives collateral at a discount.
    function liquidateBorrowInternal(
        address borrower,
        IHToken bond,
        IErc20 collateral,
        uint256 mintedHTokenAmount
    ) internal returns (uint256 seizedCollateralAmount) {
        uint256 collateralAmount = balanceSheet.getCollateralAmount(borrower, collateral);
        uint256 hypotheticalRepayAmount = balanceSheet.getRepayAmount(collateral, collateralAmount, bond);

        // If the hypothetical repay amount is bigger than the debt amount, this could be a single-collateral multi-bond
        // vault. Otherwise, it could be a multi-collateral single-bond vault. However, it is difficult to generalize
        // for the multi-collateral and multi-bond situation. The repay amount could be either bigger, smaller, or even
        // equal to the debt amount depending on the collateral and debt amount distribution.
        uint256 debtAmount = balanceSheet.getDebtAmount(borrower, bond);
        uint256 repayAmount = hypotheticalRepayAmount > debtAmount ? debtAmount : hypotheticalRepayAmount;

        // Truncate the repay amount such that we keep the dust in this contract rather than the BalanceSheet.
        uint256 truncatedRepayAmount = mintedHTokenAmount > repayAmount ? repayAmount : mintedHTokenAmount;

        // Liquidate borrow.
        uint256 oldCollateralBalance = collateral.balanceOf(address(this));
        balanceSheet.liquidateBorrow(borrower, bond, truncatedRepayAmount, collateral);
        uint256 newCollateralBalance = collateral.balanceOf(address(this));
        unchecked {
            seizedCollateralAmount = newCollateralBalance - oldCollateralBalance;
        }
    }

    /// @dev Supplies the underlying to the HToken contract to mint hTokens without taking on debt.
    function mintHTokensInternal(IHToken bond, uint256 underlyingAmount) internal returns (uint256 mintedHTokenAmount) {
        IErc20 underlying = bond.underlying();

        // Allow the HToken contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(bond));
        if (allowance < underlyingAmount) {
            underlying.approve(address(bond), type(uint256).max);
        }

        // Mint hTokens.
        uint256 preHTokenBalance = bond.balanceOf(address(this));
        bond.supplyUnderlying(underlyingAmount);
        uint256 postHTokenBalance = bond.balanceOf(address(this));
        unchecked {
            mintedHTokenAmount = postHTokenBalance - preHTokenBalance;
        }
    }
}
