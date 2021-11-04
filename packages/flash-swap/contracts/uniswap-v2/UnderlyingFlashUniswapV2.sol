// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/balanceSheet/SBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";

import "./FlashUtils.sol";
import "./IUnderlyingFlashUniswapV2.sol";
import "./IUniswapV2Pair.sol";

/// @notice Emitted when the caller is not the Uniswap V2 pair contract.
error UnderlyingFlashUniswapV2__CallNotAuthorized(address caller);

/// @notice Emitted when the flash borrowed asset is the other token in the pair instead of the underlying.
error UnderlyingFlashUniswapV2__FlashBorrowOtherToken();

/// @notice Emitted when neither the token0 nor the token1 is the underlying.
error UnderlyingFlashUniswapV2__UnderlyingNotInPool(
    IUniswapV2Pair pair,
    address token0,
    address token1,
    IErc20 underlying
);

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
    function getOtherTokenAndUnderlyingAmount(
        IUniswapV2Pair pair,
        uint256 amount0,
        uint256 amount1,
        IErc20 underlying
    ) public view override returns (IErc20 otherToken, uint256 underlyingAmount) {
        address token0 = pair.token0();
        address token1 = pair.token1();
        if (token0 == address(underlying)) {
            if (amount1 > 0) {
                revert UnderlyingFlashUniswapV2__FlashBorrowOtherToken();
            }
            otherToken = IErc20(token1);
            underlyingAmount = amount0;
        } else if (token1 == address(underlying)) {
            if (amount0 > 0) {
                revert UnderlyingFlashUniswapV2__FlashBorrowOtherToken();
            }
            otherToken = IErc20(token0);
            underlyingAmount = amount1;
        } else {
            revert UnderlyingFlashUniswapV2__UnderlyingNotInPool(pair, token0, token1, underlying);
        }
    }

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
        uint256 repayUnderlyingAmount;
        uint256 seizedUnderlyingAmount;
        uint256 shortfallUnderlyingAmount;
        address subsidizer;
        uint256 surplusUnderlyingAmount;
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
        (vars.borrower, vars.bond, vars.subsidizer) = abi.decode(data, (address, IHToken, address));

        // Figure out which token is the collateral and which token is the underlying.
        vars.underlying = vars.bond.underlying();
        (vars.otherToken, vars.underlyingAmount) = getOtherTokenAndUnderlyingAmount(
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
        vars.seizedUnderlyingAmount = FlashUtils.liquidateBorrowInternal(
            balanceSheet,
            vars.borrower,
            vars.bond,
            vars.underlying,
            vars.mintedHTokenAmount
        );

        // Calculate the amount of underlying required to repay.
        vars.repayUnderlyingAmount = getRepayUnderlyingAmount(vars.underlyingAmount);

        // When the liquidation incentive is zero, there is no incentive to liquidate underlying-backed vaults post
        // bond maturation. The flash swap fee must be subsidized when the repay underlying amount is greater than
        // the seized underlying amount.
        if (vars.repayUnderlyingAmount > vars.seizedUnderlyingAmount) {
            unchecked {
                vars.shortfallUnderlyingAmount = vars.repayUnderlyingAmount - vars.seizedUnderlyingAmount;
            }
            vars.underlying.safeTransferFrom(vars.subsidizer, address(this), vars.shortfallUnderlyingAmount);
        } else if (vars.seizedUnderlyingAmount > vars.repayUnderlyingAmount) {
            unchecked {
                vars.surplusUnderlyingAmount = vars.seizedUnderlyingAmount - vars.repayUnderlyingAmount;
            }
            vars.underlying.safeTransfer(sender, vars.shortfallUnderlyingAmount);
        }

        // Pay back the loan.
        vars.underlying.safeTransfer(msg.sender, vars.repayUnderlyingAmount);

        // Emit an event.
        emit FlashSwapUnderlyingAndLiquidateBorrow(
            sender,
            vars.borrower,
            address(vars.bond),
            vars.underlyingAmount,
            vars.seizedUnderlyingAmount,
            vars.repayUnderlyingAmount
        );
    }
}
