// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@prb/contracts/token/erc20/IErc20.sol";
import "@prb/contracts/token/erc20/SafeErc20.sol";
import "@hifi/protocol/contracts/core/balance-sheet/IBalanceSheetV2.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import "./IFlashUniswapV3.sol";
import "./IUniswapV3Pool.sol";
import "./PoolAddress.sol";

/// @title FlashUniswapV3
/// @author Hifi
contract FlashUniswapV3 is IFlashUniswapV3 {
    using SafeErc20 for IErc20;

    /// PUBLIC STORAGE ///

    /// @inheritdoc IFlashUniswapV3
    IBalanceSheetV2 public immutable override balanceSheet;

    /// @inheritdoc IFlashUniswapV3
    address public immutable override uniV3Factory;

    /// @inheritdoc IFlashUniswapV3
    address public immutable override uniV3Quoter;

    /// @inheritdoc IFlashUniswapV3
    address public immutable override uniV3SwapRouter;

    /// CONSTRUCTOR ///
    constructor(
        IBalanceSheetV2 balanceSheet_,
        address uniV3Factory_,
        address uniV3Quoter_,
        address uniV3SwapRouter_
    ) {
        balanceSheet = IBalanceSheetV2(balanceSheet_);
        uniV3Factory = uniV3Factory_;
        uniV3Quoter = uniV3Quoter_;
        uniV3SwapRouter = uniV3SwapRouter_;
    }

    struct FlashLiquidateLocalVars {
        uint256 amount0;
        uint256 amount1;
        PoolAddress.PoolKey flashPoolKey;
        address underlying;
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IFlashUniswapV3
    function flashLiquidate(FlashLiquidateParams memory params) external override {
        FlashLiquidateLocalVars memory vars;

        // This flash swap contract does not support liquidating vaults backed by underlying.
        vars.underlying = address(params.bond.underlying());
        if (params.collateral == vars.underlying) {
            revert FlashUniswapV3__LiquidateUnderlyingBackedVault({
                borrower: params.borrower,
                underlying: vars.underlying
            });
        }
        if (params.flashPoolFee == params.sellPoolFee) {
            revert FlashUniswapV3__FlashPoolAndSellPoolAreIdentical({ poolFee: params.flashPoolFee });
        }

        // Compute the flash pool key and address.
        vars.flashPoolKey = PoolAddress.getPoolKey({
            tokenA: params.collateral,
            tokenB: vars.underlying,
            fee: params.flashPoolFee
        });

        // Find amount0 and amount1 to be passed to the UniswapV3Pool contract.
        (vars.amount0, vars.amount1) = getAmount0AndAmount1({
            poolKey: vars.flashPoolKey,
            underlying: vars.underlying,
            underlyingAmount: params.underlyingAmount
        });

        IUniswapV3Pool(poolFor(vars.flashPoolKey)).flash({
            recipient: address(this),
            amount0: vars.amount0,
            amount1: vars.amount1,
            data: abi.encode(
                UniswapV3FlashCallbackParams({
                    amount0: vars.amount0,
                    amount1: vars.amount1,
                    bond: params.bond,
                    borrower: params.borrower,
                    collateral: params.collateral,
                    flashPoolKey: vars.flashPoolKey,
                    sellPoolFee: params.sellPoolFee,
                    sender: msg.sender,
                    turnout: params.turnout,
                    underlying: vars.underlying,
                    underlyingAmount: params.underlyingAmount
                })
            )
        });
    }

    struct UniswapV3FlashCallbackLocalVars {
        uint256 mintedHTokenAmount;
        uint256 profitAmount;
        uint256 repayAmount;
        uint256 seizeAmount;
        uint256 sellAmount;
        uint256 subsidyAmount;
    }

    /// @inheritdoc IUniswapV3FlashCallback
    function uniswapV3FlashCallback(
        uint256 fee0,
        uint256 fee1,
        bytes calldata data
    ) external override {
        UniswapV3FlashCallbackLocalVars memory vars;

        // Unpack the ABI encoded data passed by the UniswapV3Pool contract.
        UniswapV3FlashCallbackParams memory params = abi.decode(data, (UniswapV3FlashCallbackParams));

        // Check that the caller is the Uniswap V3 flash pool contract.
        if (msg.sender != poolFor(params.flashPoolKey)) {
            revert FlashUniswapV3__CallNotAuthorized(msg.sender);
        }

        // Mint hTokens and liquidate the borrower.
        vars.mintedHTokenAmount = mintHTokens({ bond: params.bond, underlyingAmount: params.underlyingAmount });
        vars.seizeAmount = liquidateBorrow({
            borrower: params.borrower,
            bond: params.bond,
            collateral: IErc20(params.collateral),
            mintedHTokenAmount: vars.mintedHTokenAmount
        });

        // Calculate the amount of underlying required to repay.
        vars.repayAmount = params.flashPoolKey.token0 == params.underlying
            ? params.amount0 + fee0
            : params.amount1 + fee1;

        // Calculate the amount of collateral required to sell.
        vars.sellAmount = IQuoter(uniV3Quoter).quoteExactOutputSingle({
            tokenIn: params.collateral,
            tokenOut: params.underlying,
            fee: params.sellPoolFee,
            amountOut: vars.repayAmount,
            sqrtPriceLimitX96: 0
        });

        // Note that "turnout" is a signed int. When it is negative, it acts as a maximum subsidy amount.
        // When its value is positive, it acts as a minimum profit.
        if (int256(vars.seizeAmount) < int256(vars.sellAmount) + params.turnout) {
            revert FlashUniswapV3__TurnoutNotSatisfied(vars.seizeAmount, vars.sellAmount, params.turnout);
        }

        // Transfer the subsidy amount.
        if (vars.sellAmount > vars.seizeAmount) {
            unchecked {
                vars.subsidyAmount = vars.sellAmount - vars.seizeAmount;
            }
            IErc20(params.collateral).safeTransferFrom(params.sender, address(this), vars.subsidyAmount);
        }
        // Or reap the profit.
        else if (vars.seizeAmount > vars.sellAmount) {
            unchecked {
                vars.profitAmount = vars.seizeAmount - vars.sellAmount;
            }
            IErc20(params.collateral).safeTransfer(params.sender, vars.profitAmount);
        }

        // Sell the remaining collateral to pay back the loan.
        IErc20(params.collateral).approve({ spender: uniV3SwapRouter, amount: vars.sellAmount });
        ISwapRouter(uniV3SwapRouter).exactOutputSingle(
            ISwapRouter.ExactOutputSingleParams({
                tokenIn: params.collateral,
                tokenOut: params.underlying,
                fee: params.sellPoolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountOut: vars.repayAmount,
                amountInMaximum: vars.sellAmount,
                sqrtPriceLimitX96: 0
            })
        );
        IErc20(params.underlying).safeTransfer(msg.sender, vars.repayAmount);

        // Emit an event.
        emit FlashLoanAndLiquidateBorrow({
            liquidator: params.sender,
            borrower: params.borrower,
            bond: address(params.bond),
            underlyingAmount: params.underlyingAmount,
            seizeAmount: vars.seizeAmount,
            sellAmount: vars.sellAmount,
            repayAmount: vars.repayAmount,
            subsidyAmount: vars.subsidyAmount,
            profitAmount: vars.profitAmount
        });
    }

    /// INTERNAL CONSTANT FUNCTIONS ///

    /// @dev Compares the token addresses to find amount0 and amount1.
    ///
    /// @param poolKey The Uniswap V3 PoolKey.
    /// @param underlying The address of the underlying contract.
    /// @param underlyingAmount The amount of underlying to be flash borrowed.
    /// @return amount0 The amount of token0.
    /// @return amount1 The amount of token1.
    function getAmount0AndAmount1(
        PoolAddress.PoolKey memory poolKey,
        address underlying,
        uint256 underlyingAmount
    ) internal pure returns (uint256 amount0, uint256 amount1) {
        // If underlying is token0, then amount0 = underlyingAmount.
        // Otherwise, underlying is token1, so amount1 = underlyingAmount.
        (underlying == poolKey.token0) ? amount0 = underlyingAmount : amount1 = underlyingAmount;
    }

    /// @dev Calculates the CREATE2 address for a pool without making any external calls.
    function poolFor(PoolAddress.PoolKey memory key) internal view returns (address pool) {
        pool = PoolAddress.computeAddress({ factory: uniV3Factory, key: key });
    }

    /// INTERNAL NON-CONSTANT FUNCTIONS ///

    /// @dev Liquidates the borrower, receiving collateral at a discount.
    function liquidateBorrow(
        address borrower,
        IHToken bond,
        IErc20 collateral,
        uint256 mintedHTokenAmount
    ) internal returns (uint256 seizeCollateralAmount) {
        uint256 collateralAmount = balanceSheet.getCollateralAmount(borrower, collateral);
        uint256 hypotheticalRepayAmount = balanceSheet.getRepayAmount(collateral, collateralAmount, bond);

        // If the hypothetical repay amount is bigger than the debt amount, this could be a single-collateral multi-bond
        // vault. Otherwise, it could be a multi-collateral single-bond vault. However, it is difficult to generalize
        // for the multi-collateral and multi-bond situation. The repay amount could be greater, smaller, or equal
        // to the debt amount depending on the collateral and debt amount distribution.
        uint256 debtAmount = balanceSheet.getDebtAmount(borrower, bond);
        uint256 repayAmount = hypotheticalRepayAmount > debtAmount ? debtAmount : hypotheticalRepayAmount;

        // Truncate the repay amount such that we keep the dust in this contract rather than the BalanceSheet.
        uint256 truncatedRepayAmount = mintedHTokenAmount > repayAmount ? repayAmount : mintedHTokenAmount;

        // Liquidate borrow.
        uint256 oldCollateralBalance = collateral.balanceOf(address(this));
        balanceSheet.liquidateBorrow(borrower, bond, truncatedRepayAmount, collateral);
        uint256 newCollateralBalance = collateral.balanceOf(address(this));
        unchecked {
            seizeCollateralAmount = newCollateralBalance - oldCollateralBalance;
        }
    }

    /// @dev Deposits the underlying in the HToken contract to mint hTokens on a one-to-one basis.
    function mintHTokens(IHToken bond, uint256 underlyingAmount) internal returns (uint256 mintedHTokenAmount) {
        IErc20 underlying = bond.underlying();

        // Allow the HToken contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(bond));
        if (allowance < underlyingAmount) {
            underlying.approve(address(bond), type(uint256).max);
        }

        // Deposit underlying to mint hTokens.
        uint256 oldHTokenBalance = bond.balanceOf(address(this));
        bond.depositUnderlying(underlyingAmount);
        uint256 newHTokenBalance = bond.balanceOf(address(this));
        unchecked {
            mintedHTokenAmount = newHTokenBalance - oldHTokenBalance;
        }
    }
}
