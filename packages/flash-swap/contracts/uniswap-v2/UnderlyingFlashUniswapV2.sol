// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/balanceSheet/SBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";

import "./FlashUtils.sol";
import "./IUnderlyingFlashUniswapV2.sol";

/// @notice Emitted when the caller is not the Uniswap V2 pair contract.
error UnderlyingFlashUniswapV2__CallNotAuthorized(address caller);

/// @title UnderlyingFlashUniswapV2
/// @author Hifi
contract UnderlyingFlashUniswapV2 is IUnderlyingFlashUniswapV2 {
    using SafeErc20 for IErc20;

    /// PUBLIC STORAGE ///

    /// @inheritdoc IUnderlyingFlashUniswapV2
    IBalanceSheetV1 public override balanceSheet;

    /// @inheritdoc IUnderlyingFlashUniswapV2
    address public override uniV2Factory;

    /// @inheritdoc IUnderlyingFlashUniswapV2
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

    /// @inheritdoc IUnderlyingFlashUniswapV2
    function getRepayUnderlyingAmount(uint256 underlyingAmount)
        public
        pure
        override
        returns (uint256 repayUnderlyingAmount)
    {
        // Note that we can safely use unchecked arithmetic here because the UniswapV2Pair.sol contract performs
        // sanity checks on the amounts before calling the current contract.
        unchecked {
            uint256 numerator = underlyingAmount * 1000;
            uint256 denominator = 997;
            repayUnderlyingAmount = numerator / denominator + 1;
        }
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    struct UniswapV2CallLocalVars {
        IHToken bond;
        address borrower;
        uint256 mintedHTokenAmount;
        IErc20 otherToken;
        uint256 profitUnderlyingAmount;
        uint256 repayUnderlyingAmount;
        uint256 seizeUnderlyingAmount;
        uint256 subsidyUnderlyingAmount;
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
        (vars.borrower, vars.bond) = abi.decode(data, (address, IHToken));

        // Figure out which token is the collateral and which token is the underlying.
        vars.underlying = vars.bond.underlying();
        (vars.otherToken, vars.underlyingAmount) = FlashUtils.getOtherTokenAndUnderlyingAmount(
            IUniswapV2Pair(msg.sender),
            amount0,
            amount1,
            vars.underlying
        );

        // Check that the caller is a genuine UniswapV2Pair contract.
        if (
            msg.sender !=
            FlashUtils.pairFor(uniV2Factory, uniV2PairInitCodeHash, address(vars.underlying), address(vars.otherToken))
        ) {
            revert UnderlyingFlashUniswapV2__CallNotAuthorized(msg.sender);
        }

        // Mint hTokens and liquidate the borrower.
        vars.mintedHTokenAmount = FlashUtils.mintHTokensInternal(vars.bond, vars.underlyingAmount);
        vars.seizeUnderlyingAmount = FlashUtils.liquidateBorrowInternal(
            balanceSheet,
            vars.borrower,
            vars.bond,
            vars.underlying,
            vars.mintedHTokenAmount
        );

        // Calculate the amount of underlying required to repay.
        vars.repayUnderlyingAmount = getRepayUnderlyingAmount(vars.underlyingAmount);

        // Transfer the subsidy collateral amount.
        if (vars.repayUnderlyingAmount > vars.seizeUnderlyingAmount) {
            unchecked {
                vars.subsidyUnderlyingAmount = vars.repayUnderlyingAmount - vars.seizeUnderlyingAmount;
            }
            vars.underlying.safeTransferFrom(sender, address(this), vars.subsidyUnderlyingAmount);
        }
        // Reap the profit.
        else if (vars.seizeUnderlyingAmount > vars.repayUnderlyingAmount) {
            unchecked {
                vars.profitUnderlyingAmount = vars.seizeUnderlyingAmount - vars.repayUnderlyingAmount;
            }
            vars.underlying.safeTransfer(sender, vars.profitUnderlyingAmount);
        }

        // Pay back the loan.
        vars.underlying.safeTransfer(msg.sender, vars.repayUnderlyingAmount);

        // Emit an event.
        emit FlashSwapUnderlyingAndLiquidateBorrow(
            sender,
            vars.borrower,
            address(vars.bond),
            vars.underlyingAmount,
            vars.seizeUnderlyingAmount,
            vars.repayUnderlyingAmount,
            vars.subsidyUnderlyingAmount,
            vars.profitUnderlyingAmount
        );
    }
}
