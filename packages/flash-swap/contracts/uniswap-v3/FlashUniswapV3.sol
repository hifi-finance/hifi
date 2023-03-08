// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@prb/contracts/token/erc20/IErc20.sol";
import "@prb/contracts/token/erc20/SafeErc20.sol";
import "@hifi/protocol/contracts/core/balance-sheet/IBalanceSheetV2.sol";

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

    /// @dev TickMath constants for computing the sqrt price limit.
    uint160 internal constant MIN_SQRT_RATIO = 4295128739;
    uint160 internal constant MAX_SQRT_RATIO = 1461446703485210103287273052203988822378723970342;

    /// CONSTRUCTOR ///
    constructor(IBalanceSheetV2 balanceSheet_, address uniV3Factory_) {
        balanceSheet = IBalanceSheetV2(balanceSheet_);
        uniV3Factory = uniV3Factory_;
    }

    struct FlashLiquidateLocalVars {
        PoolAddress.PoolKey poolKey;
        address underlying;
        bool zeroForOne;
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

        // Compute the flash pool key and address.
        vars.poolKey = PoolAddress.getPoolKey({
            tokenA: params.collateral,
            tokenB: vars.underlying,
            fee: params.poolFee
        });

        // The direction of the swap, true for token0 to token1, false for token1 to token0.
        vars.zeroForOne = vars.underlying == vars.poolKey.token1;

        IUniswapV3Pool(poolFor(vars.poolKey)).swap({
            recipient: address(this),
            zeroForOne: vars.zeroForOne,
            amountSpecified: int256(params.underlyingAmount) * -1,
            sqrtPriceLimitX96: vars.zeroForOne ? MIN_SQRT_RATIO + 1 : MAX_SQRT_RATIO - 1,
            data: abi.encode(
                UniswapV3SwapCallbackParams({
                    bond: params.bond,
                    borrower: params.borrower,
                    collateral: params.collateral,
                    poolKey: vars.poolKey,
                    sender: msg.sender,
                    turnout: params.turnout,
                    underlyingAmount: params.underlyingAmount
                })
            )
        });
    }

    struct UniswapV3SwapCallbackLocalVars {
        uint256 mintedHTokenAmount;
        uint256 profitAmount;
        uint256 repayAmount;
        uint256 seizeAmount;
        uint256 subsidyAmount;
    }

    /// @inheritdoc IUniswapV3SwapCallback
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external override {
        UniswapV3SwapCallbackLocalVars memory vars;

        // Unpack the ABI encoded data passed by the UniswapV3Pool contract.
        UniswapV3SwapCallbackParams memory params = abi.decode(data, (UniswapV3SwapCallbackParams));

        // Check that the caller is the Uniswap V3 flash pool contract.
        if (msg.sender != poolFor(params.poolKey)) {
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

        // Calculate the amount of collateral required to repay.
        vars.repayAmount = uint256(amount0Delta > 0 ? amount0Delta : amount1Delta);

        // Note that "turnout" is a signed int. When it is negative, it acts as a maximum subsidy amount.
        // When its value is positive, it acts as a minimum profit.
        if (int256(vars.seizeAmount) < int256(vars.repayAmount) + params.turnout) {
            revert FlashUniswapV3__TurnoutNotSatisfied({
                seizeAmount: vars.seizeAmount,
                repayAmount: vars.repayAmount,
                turnout: params.turnout
            });
        }

        // Transfer the subsidy amount.
        if (vars.repayAmount > vars.seizeAmount) {
            unchecked {
                vars.subsidyAmount = vars.repayAmount - vars.seizeAmount;
            }
            IErc20(params.collateral).safeTransferFrom(params.sender, address(this), vars.subsidyAmount);
        }
        // Or reap the profit.
        else if (vars.seizeAmount > vars.repayAmount) {
            unchecked {
                vars.profitAmount = vars.seizeAmount - vars.repayAmount;
            }
            IErc20(params.collateral).safeTransfer(params.sender, vars.profitAmount);
        }

        // Pay back the loan.
        IErc20(params.collateral).safeTransfer(msg.sender, vars.repayAmount);

        // Emit an event.
        emit FlashSwapAndLiquidateBorrow({
            liquidator: params.sender,
            borrower: params.borrower,
            bond: address(params.bond),
            collateral: params.collateral,
            underlyingAmount: params.underlyingAmount,
            seizeAmount: vars.seizeAmount,
            repayAmount: vars.repayAmount,
            subsidyAmount: vars.subsidyAmount,
            profitAmount: vars.profitAmount
        });
    }

    /// INTERNAL CONSTANT FUNCTIONS ///

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
