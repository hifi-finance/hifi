// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/balanceSheet/SBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";

import "./FlashUtils.sol";
import "./ICollateralFlashUniswapV2.sol";
import "./IUniswapV2Pair.sol";

/// @notice Emitted when the caller is not the Uniswap V2 pair contract.
error CollateralFlashUniswapV2__CallNotAuthorized(address caller);

/// @notice Emitted when the liquidation either does not yield a sufficient profit or it costs more
/// than what the subsidizer is willing to pay.
error CollateralFlashUniswapV2__TurnoutNotSatisfied(
    uint256 seizeCollateralAmount,
    uint256 repayCollateralAmount,
    int256 turnout
);

/// @title CollateralFlashUniswapV2
/// @author Hifi
contract CollateralFlashUniswapV2 is ICollateralFlashUniswapV2 {
    using SafeErc20 for IErc20;

    /// PUBLIC STORAGE ///

    /// @inheritdoc ICollateralFlashUniswapV2
    IBalanceSheetV1 public override balanceSheet;

    /// @inheritdoc ICollateralFlashUniswapV2
    address public override uniV2Factory;

    /// @inheritdoc ICollateralFlashUniswapV2
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

    /// @inheritdoc ICollateralFlashUniswapV2
    function getRepayCollateralAmount(
        IUniswapV2Pair pair,
        IErc20 underlying,
        uint256 underlyingAmount
    ) public view override returns (uint256 repayCollateralAmount) {
        // Depending upon which token is which, the reserves are returned in a different order.
        address token0 = pair.token0();
        uint112 collateralReserves;
        uint112 underlyingReserves;
        if (token0 == address(underlying)) {
            (underlyingReserves, collateralReserves, ) = pair.getReserves();
        } else {
            (collateralReserves, underlyingReserves, ) = pair.getReserves();
        }

        // Note that we can safely use unchecked arithmetic here because the UniswapV2Pair.sol contract performs
        // sanity checks on the amounts before calling the current contract.
        unchecked {
            uint256 numerator = collateralReserves * underlyingAmount * 1000;
            uint256 denominator = (underlyingReserves - underlyingAmount) * 997;
            repayCollateralAmount = numerator / denominator + 1;
        }
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    struct UniswapV2CallLocalVars {
        IHToken bond;
        address borrower;
        IErc20 collateral;
        uint256 mintedHTokenAmount;
        uint256 profitCollateralAmount;
        uint256 repayCollateralAmount;
        uint256 seizeCollateralAmount;
        uint256 subsidyCollateralAmount;
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
        (vars.borrower, vars.bond, vars.turnout) = abi.decode(data, (address, IHToken, int256));

        // Figure out which token is the collateral and which token is the underlying.
        vars.underlying = vars.bond.underlying();
        (vars.collateral, vars.underlyingAmount) = FlashUtils.getOtherTokenAndUnderlyingAmount(
            IUniswapV2Pair(msg.sender),
            amount0,
            amount1,
            vars.underlying
        );

        // Check that the caller is a genuine UniswapV2Pair contract.
        if (
            msg.sender !=
            FlashUtils.pairFor(uniV2Factory, uniV2PairInitCodeHash, address(vars.underlying), address(vars.collateral))
        ) {
            revert CollateralFlashUniswapV2__CallNotAuthorized(msg.sender);
        }

        // Mint hTokens and liquidate the borrower.
        vars.mintedHTokenAmount = FlashUtils.mintHTokensInternal(vars.bond, vars.underlyingAmount);
        vars.seizeCollateralAmount = FlashUtils.liquidateBorrowInternal(
            balanceSheet,
            vars.borrower,
            vars.bond,
            vars.collateral,
            vars.mintedHTokenAmount
        );

        // Calculate the amount of collateral required to repay.
        vars.repayCollateralAmount = getRepayCollateralAmount(
            IUniswapV2Pair(msg.sender),
            vars.underlying,
            vars.underlyingAmount
        );

        // Note that "turnout" is a signed int. When its value is positive, it acts as a minimum profit.
        // When it is negative, it acts as a maximum subsidy amount.
        if (int256(vars.seizeCollateralAmount) <= int256(vars.repayCollateralAmount) + vars.turnout) {
            revert CollateralFlashUniswapV2__TurnoutNotSatisfied(
                vars.seizeCollateralAmount,
                vars.repayCollateralAmount,
                vars.turnout
            );
        }

        // Transfer the subsidy collateral amount.
        if (vars.repayCollateralAmount > vars.seizeCollateralAmount) {
            unchecked {
                vars.subsidyCollateralAmount = vars.repayCollateralAmount - vars.seizeCollateralAmount;
            }
            vars.collateral.safeTransferFrom(sender, address(this), vars.subsidyCollateralAmount);
        }
        // Reap the profit.
        else if (vars.seizeCollateralAmount > vars.repayCollateralAmount) {
            unchecked {
                vars.profitCollateralAmount = vars.seizeCollateralAmount - vars.repayCollateralAmount;
            }
            vars.collateral.safeTransfer(sender, vars.profitCollateralAmount);
        }

        // Pay back the loan.
        vars.collateral.safeTransfer(msg.sender, vars.repayCollateralAmount);

        // Emit an event.
        emit FlashSwapCollateralAndLiquidateBorrow(
            sender,
            vars.borrower,
            address(vars.bond),
            vars.underlyingAmount,
            vars.seizeCollateralAmount,
            vars.repayCollateralAmount,
            vars.subsidyCollateralAmount,
            vars.profitCollateralAmount
        );
    }
}
