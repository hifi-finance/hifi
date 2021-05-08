// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/token/erc20/Erc20.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";
import "@paulrberg/contracts/token/erc20/Erc20Permit.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";

import "./HifiPoolInterface.sol";
import "./interfaces/FyTokenLike.sol";
import "./math/YieldSpace.sol";

contract HifiPool is
    HifiPoolInterface, /// one dependency
    Erc20, /// two dependencies
    Erc20Permit /// five dependencies
{
    using SafeErc20 for Erc20Interface;

    /// @dev Trading can only occur prior to maturity.
    modifier isBeforeMaturity() {
        require(block.timestamp < maturity, "HifiPool: bond matured");
        _;
    }

    constructor(
        Erc20Interface underlying_,
        FyTokenLike fyToken_,
        string memory name_,
        string memory symbol_
    ) Erc20Permit(name_, symbol_, 18) {
        underlying = underlying_;
        fyToken = fyToken_;
        maturity = fyToken_.expirationTime();
    }

    /// CONSTANT FUNCTIONS ///

    /// @inheritdoc HifiPoolInterface
    function getQuoteForBuyingFyToken(int256 fyTokenOut)
        public
        view
        override
        isBeforeMaturity
        returns (int256 underlyingIn)
    {
        int256 underlyingReserves = getUnderlyingReserves();
        int256 virtualFyTokenReserves = getVirtualFyTokenReserves();

        underlyingIn = YieldSpace.underlyingInForFyTokenOut(
            underlyingReserves,
            virtualFyTokenReserves,
            fyTokenOut,
            int256(maturity - block.timestamp)
        );
        require(
            virtualFyTokenReserves - fyTokenOut >= underlyingReserves + underlyingIn,
            "HifiPool: too low fyToken reserves"
        );
    }

    /// @inheritdoc HifiPoolInterface
    function getQuoteForBuyingUnderlying(int256 underlyingOut)
        public
        view
        override
        isBeforeMaturity
        returns (int256 fyTokenIn)
    {
        fyTokenIn = YieldSpace.fyTokenInForUnderlyingOut(
            getUnderlyingReserves(),
            getVirtualFyTokenReserves(),
            underlyingOut,
            int256(maturity - block.timestamp)
        );
    }

    /// @inheritdoc HifiPoolInterface
    function getQuoteForSellingFyToken(int256 fyTokenIn)
        public
        view
        override
        isBeforeMaturity
        returns (int256 underlyingOut)
    {
        return
            YieldSpace.underlyingOutForFyTokenIn(
                getUnderlyingReserves(),
                getVirtualFyTokenReserves(),
                fyTokenIn,
                int256(maturity - block.timestamp)
            );
    }

    /// @inheritdoc HifiPoolInterface
    function getQuoteForSellingUnderlying(int256 underlyingIn)
        public
        view
        override
        isBeforeMaturity
        returns (int256 fyTokenOut)
    {
        int256 underlyingReserves = getUnderlyingReserves();
        int256 virtualFyTokenReserves = getVirtualFyTokenReserves();

        fyTokenOut = YieldSpace.fyTokenOutForUnderlyingIn(
            underlyingReserves,
            virtualFyTokenReserves,
            underlyingIn,
            int256(maturity - block.timestamp)
        );
        require(
            virtualFyTokenReserves - fyTokenOut >= underlyingReserves + underlyingIn,
            "HifiPool: too low fyToken reserves"
        );
    }

    /// @inheritdoc HifiPoolInterface
    function getUnderlyingReserves() public view override returns (int256 underlyingReserves) {
        uint256 underlyingReservesUnsigned = underlying.balanceOf(address(this));
        require(underlyingReservesUnsigned <= uint256(type(int256).max), "HifiPool: Cast overflow");
        underlyingReserves = int256(underlyingReservesUnsigned);
    }

    /// @inheritdoc HifiPoolInterface
    function getVirtualFyTokenReserves() public view override returns (int256 virtualFyTokenReserves) {
        uint256 virtualFyTokenReservesUnsigned = fyToken.balanceOf(address(this)) + totalSupply;
        require(virtualFyTokenReservesUnsigned <= uint256(type(int256).max), "HifiPool: Cast overflow");
        virtualFyTokenReserves = int256(virtualFyTokenReservesUnsigned);
    }

    /// NON-CONSTANT EXTERNAL FUNCTIONS ///

    /// @inheritdoc HifiPoolInterface
    function burn(uint256 poolTokensBurned)
        external
        override
        returns (uint256 underlyingReturned, uint256 fyTokenReturned)
    {
        // Checks: avoid the zero edge case.
        require(poolTokensBurned > 0, "HifiPool: cannot burn zero tokens");

        uint256 supply = totalSupply;
        uint256 underlyingReserves = underlying.balanceOf(address(this));

        // Use the actual reserves rather than the virtual reserves.
        {
            // Avoiding stack too deep.
            uint256 fyTokenReserves = fyToken.balanceOf(address(this));
            underlyingReturned = (poolTokensBurned * underlyingReserves) / supply;
            fyTokenReturned = (poolTokensBurned * fyTokenReserves) / supply;
        }

        // Effects
        burnInternal(msg.sender, poolTokensBurned);

        // Interactions
        underlying.safeTransfer(msg.sender, underlyingReturned);
        fyToken.transfer(msg.sender, fyTokenReturned);

        emit RemoveLiquidity(maturity, msg.sender, underlyingReturned, fyTokenReturned, poolTokensBurned);
    }

    /// @inheritdoc HifiPoolInterface
    function buyFyToken(address to, int256 fyTokenOut) external override returns (int256 underlyingIn) {
        // Checks: avoid the zero edge case.
        require(fyTokenOut > 0, "HifiPool: cannot buy with zero fyToken");

        underlyingIn = getQuoteForBuyingFyToken(fyTokenOut);

        // Interactions
        underlying.safeTransferFrom(msg.sender, address(this), uint256(underlyingIn));
        fyToken.transfer(to, uint256(fyTokenOut));

        // TODO: check if `underlyingIn` is not min int256
        emit Trade(maturity, msg.sender, to, -underlyingIn, fyTokenOut);
    }

    /// @inheritdoc HifiPoolInterface
    function buyUnderlying(address to, int256 underlyingOut) external override returns (int256 fyTokenIn) {
        // Checks: avoid the zero edge case.
        require(underlyingOut > 0, "HifiPool: cannot buy with zero underlying");

        fyTokenIn = getQuoteForBuyingUnderlying(underlyingOut);

        // Interactions
        fyToken.transferFrom(msg.sender, address(this), uint256(fyTokenIn));
        underlying.safeTransfer(to, uint256(underlyingOut));

        // TODO: check if `fyTokenIn` is not min int256
        emit Trade(maturity, msg.sender, to, underlyingOut, -fyTokenIn);
    }

    /// @inheritdoc HifiPoolInterface
    function mint(uint256 underlyingOffered) external override returns (uint256 poolTokensMinted) {
        // Checks: avoid the zero edge case.
        require(underlyingOffered > 0, "HifiPool: cannot offer zero underlying");

        uint256 supply = totalSupply;
        if (supply == 0) {
            initialize(underlyingOffered);
            return underlyingOffered;
        }

        uint256 underlyingReserves = underlying.balanceOf(address(this));
        // Use the actual reserves rather than the virtual reserves.
        uint256 fyTokenReserves = fyToken.balanceOf(address(this));
        poolTokensMinted = (supply * underlyingOffered) / underlyingReserves;
        uint256 fyTokenRequired = (fyTokenReserves * poolTokensMinted) / supply;

        // Effects
        mintInternal(msg.sender, poolTokensMinted);

        // Interactions
        underlying.safeTransferFrom(msg.sender, address(this), underlyingOffered);
        fyToken.transferFrom(msg.sender, address(this), fyTokenRequired);

        emit AddLiquidity(maturity, msg.sender, underlyingOffered, fyTokenRequired, poolTokensMinted);
    }

    /// @inheritdoc HifiPoolInterface
    function sellFyToken(address to, int256 fyTokenIn)
        external
        override
        isBeforeMaturity
        returns (int256 underlyingOut)
    {
        // Checks: avoid the zero edge case.
        require(fyTokenIn > 0, "HifiPool: cannot sell zero fyToken");

        underlyingOut = getQuoteForSellingFyToken(fyTokenIn);

        // Interactions
        fyToken.transferFrom(msg.sender, address(this), uint256(fyTokenIn));
        underlying.safeTransfer(to, uint256(underlyingOut));

        // TODO: check if `fyTokenIn` is not min int256
        emit Trade(maturity, msg.sender, to, underlyingOut, -fyTokenIn);
    }

    /// @inheritdoc HifiPoolInterface
    function sellUnderlying(address to, int256 underlyingIn) external override returns (int256 fyTokenOut) {
        // Checks: avoid the zero edge case.
        require(underlyingIn > 0, "HifiPool: cannot sell zero underlying");

        fyTokenOut = getQuoteForSellingUnderlying(underlyingIn);

        // Interactions
        underlying.safeTransferFrom(msg.sender, address(this), uint256(underlyingIn));
        fyToken.transfer(to, uint256(fyTokenOut));

        // TODO: check if `underlyingIn` is not min int256
        emit Trade(maturity, msg.sender, to, -underlyingIn, fyTokenOut);
    }

    /// NON-CONSTANT INTERNAL FUNCTIONS ///

    /// @notice Mints initial liquidity tokens. There is no need to transfer fyTokens initially because the
    /// first fyToken deposit is virtual.
    ///
    /// @dev Emits an {AddLiquidity} event.
    ///
    /// Requirements:
    /// - The caller must have allowed this contract to spend `underlyingAmount` underlying tokens.
    ///
    /// @param underlyingAmount The initial underlying liquidity to provide.
    function initialize(uint256 underlyingAmount) internal isBeforeMaturity {
        // Checks
        require(totalSupply == 0, "HifiPool: initialized");

        // Effects
        mintInternal(msg.sender, underlyingAmount);

        // Interactions
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        emit AddLiquidity(maturity, msg.sender, underlyingAmount, 0, underlyingAmount);
    }
}
