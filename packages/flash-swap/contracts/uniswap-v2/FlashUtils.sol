// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";

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

    /// @dev Liquidates the borrower, receiving collateral at a discount.
    function liquidateBorrowInternal(
        IBalanceSheetV1 balanceSheet,
        address borrower,
        IHToken bond,
        IErc20 collateral,
        uint256 mintedHTokenAmount
    ) internal returns (uint256 seizedCollateralAmount) {
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
        uint256 oldHTokenBalance = bond.balanceOf(address(this));
        bond.supplyUnderlying(underlyingAmount);
        uint256 newHTokenBalance = bond.balanceOf(address(this));
        unchecked {
            mintedHTokenAmount = newHTokenBalance - oldHTokenBalance;
        }
    }
}
