// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/balanceSheet/SBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";

import "./IFlashUniswapV2.sol";
import "./IUniswapV2Pair.sol";

/// @title FlashUniswapV2
/// @author Hifi
contract FlashUniswapV2 is IFlashUniswapV2 {
    using SafeErc20 for IErc20;

    /// PUBLIC STORAGE ///

    /// @inheritdoc IFlashUniswapV2
    IBalanceSheetV1 public override balanceSheet;

    /// @inheritdoc IFlashUniswapV2
    address public override uniV2Factory;

    /// @inheritdoc IFlashUniswapV2
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

    /// @inheritdoc IFlashUniswapV2
    function getRepayAmount(
        IUniswapV2Pair pair,
        IErc20 collateral,
        IErc20 underlying,
        uint256 underlyingAmount
    ) public view override returns (uint256 repayAmount) {
        unchecked {
            uint256 numerator;
            uint256 denominator;
            if (collateral != underlying) {
                uint112 collateralReserves;
                uint112 underlyingReserves;

                address token0 = pair.token0();
                if (token0 == address(underlying)) {
                    (underlyingReserves, collateralReserves, ) = pair.getReserves();
                } else {
                    (collateralReserves, underlyingReserves, ) = pair.getReserves();
                }

                numerator = collateralReserves * underlyingAmount * 1000;
                denominator = (underlyingReserves - underlyingAmount) * 997;
            } else {
                numerator = underlyingAmount * 1000;
                denominator = 997;
            }
            repayAmount = numerator / denominator + 1;
        }
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    struct UniswapV2CallLocalVars {
        IHToken bond;
        address borrower;
        IErc20 collateral;
        uint256 mintedHTokenAmount;
        IErc20 otherToken;
        uint256 profitAmount;
        uint256 repayAmount;
        uint256 seizeAmount;
        uint256 subsidyAmount;
        int256 turnout;
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
        (vars.borrower, vars.bond, vars.collateral, vars.turnout) = abi.decode(
            data,
            (address, IHToken, IErc20, int256)
        );

        // Figure out which token is which.
        vars.underlying = vars.bond.underlying();
        (vars.otherToken, vars.underlyingAmount) = getOtherTokenAndUnderlyingAmount(
            IUniswapV2Pair(msg.sender),
            amount0,
            amount1,
            vars.underlying
        );

        // Check that the caller is a genuine UniswapV2Pair contract.
        if (msg.sender != pairFor(address(vars.underlying), address(vars.otherToken))) {
            revert FlashUniswapV2__CallNotAuthorized(msg.sender);
        }

        // Mint hTokens and liquidate the borrower.
        vars.mintedHTokenAmount = mintHTokens(vars.bond, vars.underlyingAmount);
        vars.seizeAmount = liquidateBorrow(vars.borrower, vars.bond, vars.collateral, vars.mintedHTokenAmount);

        // Calculate the amount required to repay.
        vars.repayAmount = getRepayAmount(
            IUniswapV2Pair(msg.sender),
            vars.collateral,
            vars.underlying,
            vars.underlyingAmount
        );

        // Note that "turnout" is a signed int. When it is negative, it acts as a maximum subsidy amount.
        // When its value is positive, it acts as a minimum profit.
        if (int256(vars.seizeAmount) < int256(vars.repayAmount) + vars.turnout) {
            revert FlashUniswapV2__TurnoutNotSatisfied(vars.seizeAmount, vars.repayAmount, vars.turnout);
        }

        // Transfer the subsidy amount.
        if (vars.repayAmount > vars.seizeAmount) {
            unchecked {
                vars.subsidyAmount = vars.repayAmount - vars.seizeAmount;
            }
            vars.collateral.safeTransferFrom(sender, address(this), vars.subsidyAmount);
        }
        // Or reap the profit.
        else if (vars.seizeAmount > vars.repayAmount) {
            unchecked {
                vars.profitAmount = vars.seizeAmount - vars.repayAmount;
            }
            vars.collateral.safeTransfer(sender, vars.profitAmount);
        }

        // Pay back the loan.
        vars.collateral.safeTransfer(msg.sender, vars.repayAmount);

        // Emit an event.
        emit FlashSwapAndLiquidateBorrow(
            sender,
            vars.borrower,
            address(vars.bond),
            vars.underlyingAmount,
            vars.seizeAmount,
            vars.repayAmount,
            vars.subsidyAmount,
            vars.profitAmount
        );
    }

    /// INTERNAL CONSTANT FUNCTIONS ///

    /// @notice Compares the token addresses to find the other token and the underlying amount.
    /// @dev See this StackExchange post: https://ethereum.stackexchange.com/q/102670/24693.
    ///
    /// Requirements:
    ///
    /// - The amount of non-underlying flash borrowed must be zero.
    /// - The underlying must be one of the pair's tokens.
    ///
    /// @param pair The Uniswap V2 pair contract.
    /// @param amount0 The amount of token0.
    /// @param amount1 The amount of token1.
    /// @param underlying The address of the underlying contract.
    /// @return otherToken The address of the other token contract.
    /// @return underlyingAmount The amount of underlying flash borrowed.
    function getOtherTokenAndUnderlyingAmount(
        IUniswapV2Pair pair,
        uint256 amount0,
        uint256 amount1,
        IErc20 underlying
    ) internal view returns (IErc20 otherToken, uint256 underlyingAmount) {
        address token0 = pair.token0();
        address token1 = pair.token1();
        if (token0 == address(underlying)) {
            if (amount1 > 0) {
                revert FlashUniswapV2__FlashBorrowOtherToken();
            }
            otherToken = IErc20(token1);
            underlyingAmount = amount0;
        } else if (token1 == address(underlying)) {
            if (amount0 > 0) {
                revert FlashUniswapV2__FlashBorrowOtherToken();
            }
            otherToken = IErc20(token0);
            underlyingAmount = amount1;
        } else {
            revert FlashUniswapV2__UnderlyingNotInPool(pair, token0, token1, underlying);
        }
    }

    /// @dev Calculates the CREATE2 address for a pair without making any external calls.
    function pairFor(address tokenA, address tokenB) internal view returns (address pair) {
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

    /// @dev Supplies the underlying to the HToken contract to mint hTokens without taking on debt.
    function mintHTokens(IHToken bond, uint256 underlyingAmount) internal returns (uint256 mintedHTokenAmount) {
        IErc20 underlying = bond.underlying();

        // Allow the HToken contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(bond));
        if (allowance < underlyingAmount) {
            underlying.approve(address(bond), type(uint256).max);
        }

        // Mint hTokens.
        uint256 oldHTokenBalance = bond.balanceOf(address(this));
        bond.supplyUnderlying(underlyingAmount);
        uint256 newHTokenBalance = bond.balanceOf(address(this));
        unchecked {
            mintedHTokenAmount = newHTokenBalance - oldHTokenBalance;
        }
    }
}
