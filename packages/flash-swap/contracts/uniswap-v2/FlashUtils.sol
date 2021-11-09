// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";

import "./IUniswapV2Pair.sol";

/// @notice Emitted when the caller is not the Uniswap V2 pair contract.
error FlashUtils__CallNotAuthorized(address caller);

/// @notice Emitted when the flash borrowed asset is the other token in the pair instead of the underlying.
error FlashUtils__FlashBorrowOtherToken();

/// @notice Emitted when neither the token0 nor the token1 is the underlying.
error FlashUtils__UnderlyingNotInPool(IUniswapV2Pair pair, address token0, address token1, IErc20 underlying);

/// @title FlashUtils
/// @author Hifi
library FlashUtils {
    /// @dev Calculates the CREATE2 address for a pair without making any external calls.
    function pairFor(
        address uniV2Factory,
        bytes32 uniV2PairInitCodeHash,
        address tokenA,
        address tokenB
    ) internal pure returns (address pair) {
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
                revert FlashUtils__FlashBorrowOtherToken();
            }
            otherToken = IErc20(token1);
            underlyingAmount = amount0;
        } else if (token1 == address(underlying)) {
            if (amount0 > 0) {
                revert FlashUtils__FlashBorrowOtherToken();
            }
            otherToken = IErc20(token0);
            underlyingAmount = amount1;
        } else {
            revert FlashUtils__UnderlyingNotInPool(pair, token0, token1, underlying);
        }
    }

    /// @dev Liquidates the borrower, receiving collateral at a discount.
    function liquidateBorrowInternal(
        IBalanceSheetV1 balanceSheet,
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
    function mintHTokensInternal(IHToken bond, uint256 underlyingAmount) internal returns (uint256 mintedHTokenAmount) {
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
