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

    /// @notice Instantiates the HifiPool.
    /// @dev The HifiPool LP token always has 18 decimals.
    /// @param name_ Erc20 name of this token.
    /// @param symbol_ Erc20 symbol of this token.
    /// @param underlying_ The contract address of the underlying.
    /// @param fyToken_ The contract address of the fyToken.
    constructor(
        string memory name_,
        string memory symbol_,
        Erc20Interface underlying_,
        FyTokenLike fyToken_
    ) Erc20Permit(name_, symbol_, 18) {
        // Calculate the precision scalar and save the underlying contract address in storage.
        uint256 underlyingDecimals = underlying_.decimals();
        require(underlyingDecimals > 0, "HifiPool: zero decimals underlying");
        require(underlyingDecimals <= 18, "HifiPool: >18 decimals underlying");
        underlyingPrecisionScalar = 10**(18 - underlyingDecimals);
        underlying = underlying_;

        // Save the fyToken contract address in storage and sanity check it.
        fyToken = fyToken_;
        fyToken.isFyToken();

        // Save the fyToken maturity time in storage.
        maturity = fyToken_.expirationTime();
    }

    /// CONSTANT FUNCTIONS ///

    /// @inheritdoc HifiPoolInterface
    function getQuoteForBuyingFyToken(uint256 fyTokenOut)
        public
        view
        override
        isBeforeMaturity
        returns (uint256 underlyingIn)
    {
        uint256 normalizedUnderlyingReserves = getNormalizedUnderlyingReserves();
        uint256 virtualFyTokenReserves = getVirtualFyTokenReserves();
        uint256 normalizedUnderlyingIn =
            YieldSpace.underlyingInForFyTokenOut(
                normalizedUnderlyingReserves,
                virtualFyTokenReserves,
                fyTokenOut,
                uint256(maturity - block.timestamp)
            );
        require(
            virtualFyTokenReserves - fyTokenOut >= normalizedUnderlyingReserves + normalizedUnderlyingIn,
            "HifiPool: too low fyToken reserves"
        );
        underlyingIn = denormalize(normalizedUnderlyingIn);
    }

    /// @inheritdoc HifiPoolInterface
    function getQuoteForBuyingUnderlying(uint256 underlyingOut)
        public
        view
        override
        isBeforeMaturity
        returns (uint256 fyTokenIn)
    {
        fyTokenIn = YieldSpace.fyTokenInForUnderlyingOut(
            getNormalizedUnderlyingReserves(),
            getVirtualFyTokenReserves(),
            normalize(underlyingOut),
            uint256(maturity - block.timestamp)
        );
    }

    /// @inheritdoc HifiPoolInterface
    function getQuoteForSellingFyToken(uint256 fyTokenIn)
        public
        view
        override
        isBeforeMaturity
        returns (uint256 underlyingOut)
    {
        uint256 normalizedUnderlyingOut =
            YieldSpace.underlyingOutForFyTokenIn(
                getNormalizedUnderlyingReserves(),
                getVirtualFyTokenReserves(),
                fyTokenIn,
                uint256(maturity - block.timestamp)
            );
        underlyingOut = denormalize(normalizedUnderlyingOut);
    }

    /// @inheritdoc HifiPoolInterface
    function getQuoteForSellingUnderlying(uint256 underlyingIn)
        public
        view
        override
        isBeforeMaturity
        returns (uint256 fyTokenOut)
    {
        uint256 normalizedUnderlyingIn = normalize(underlyingIn);
        uint256 normalizedUnderlyingReserves = getNormalizedUnderlyingReserves();
        uint256 virtualFyTokenReserves = getVirtualFyTokenReserves();
        fyTokenOut = YieldSpace.fyTokenOutForUnderlyingIn(
            normalizedUnderlyingReserves,
            virtualFyTokenReserves,
            normalizedUnderlyingIn,
            uint256(maturity - block.timestamp)
        );
        require(
            virtualFyTokenReserves - fyTokenOut >= normalizedUnderlyingReserves + normalizedUnderlyingIn,
            "HifiPool: too low fyToken reserves"
        );
    }

    /// @inheritdoc HifiPoolInterface
    function getNormalizedUnderlyingReserves() public view override returns (uint256 normalizedUnderlyingReserves) {
        normalizedUnderlyingReserves = normalize(underlying.balanceOf(address(this)));
    }

    /// @inheritdoc HifiPoolInterface
    function getVirtualFyTokenReserves() public view override returns (uint256 virtualFyTokenReserves) {
        virtualFyTokenReserves = fyToken.balanceOf(address(this)) + totalSupply;
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
        uint256 normalizedUnderlyingReserves = getNormalizedUnderlyingReserves();

        // Use the actual reserves rather than the virtual reserves.
        {
            // Avoiding stack too deep.
            uint256 fyTokenReserves = fyToken.balanceOf(address(this));
            uint256 normalizedUnderlyingReturned = (poolTokensBurned * normalizedUnderlyingReserves) / supply;
            underlyingReturned = denormalize(normalizedUnderlyingReturned);
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
    function buyFyToken(address to, uint256 fyTokenOut) external override returns (uint256 underlyingIn) {
        // Checks: avoid the zero edge case.
        require(fyTokenOut > 0, "HifiPool: cannot buy with zero fyToken");

        underlyingIn = getQuoteForBuyingFyToken(fyTokenOut);

        // Interactions
        underlying.safeTransferFrom(msg.sender, address(this), uint256(underlyingIn));
        fyToken.transfer(to, uint256(fyTokenOut));

        // TODO: implement safe cast
        emit Trade(maturity, msg.sender, to, -int256(underlyingIn), int256(fyTokenOut));
    }

    /// @inheritdoc HifiPoolInterface
    function buyUnderlying(address to, uint256 underlyingOut) external override returns (uint256 fyTokenIn) {
        // Checks: avoid the zero edge case.
        require(underlyingOut > 0, "HifiPool: cannot buy with zero underlying");

        fyTokenIn = getQuoteForBuyingUnderlying(underlyingOut);

        // Interactions
        underlying.safeTransfer(to, uint256(underlyingOut));
        fyToken.transferFrom(msg.sender, address(this), uint256(fyTokenIn));

        // TODO: implement safe cast
        emit Trade(maturity, msg.sender, to, int256(underlyingOut), -int256(fyTokenIn));
    }

    /// @inheritdoc HifiPoolInterface
    function mint(uint256 underlyingOffered) external override returns (uint256 poolTokensMinted) {
        // Checks: avoid the zero edge case.
        require(underlyingOffered > 0, "HifiPool: cannot offer zero underlying");

        // Our native precision is 18 decimals so the underlying amount needs to be normalized.
        uint256 normalizedUnderlyingOffered = normalize(underlyingOffered);

        // When there are no LP tokens in existence, only underlying needs to be provided.
        uint256 supply = totalSupply;
        if (supply == 0) {
            // Effects
            mintInternal(msg.sender, normalizedUnderlyingOffered);

            // Interactions
            underlying.safeTransferFrom(msg.sender, address(this), normalizedUnderlyingOffered);

            emit AddLiquidity(maturity, msg.sender, underlyingOffered, 0, underlyingOffered);
            return normalizedUnderlyingOffered;
        }

        // We need to use the actual reserves rather than the virtual reserves here.
        uint256 fyTokenReserves = fyToken.balanceOf(address(this));
        poolTokensMinted = (supply * normalizedUnderlyingOffered) / getNormalizedUnderlyingReserves();
        uint256 fyTokenRequired = (fyTokenReserves * poolTokensMinted) / supply;

        // Effects
        mintInternal(msg.sender, poolTokensMinted);

        // Interactions
        underlying.safeTransferFrom(msg.sender, address(this), underlyingOffered);
        fyToken.transferFrom(msg.sender, address(this), fyTokenRequired);

        emit AddLiquidity(maturity, msg.sender, underlyingOffered, fyTokenRequired, poolTokensMinted);
    }

    /// @inheritdoc HifiPoolInterface
    function sellFyToken(address to, uint256 fyTokenIn)
        external
        override
        isBeforeMaturity
        returns (uint256 underlyingOut)
    {
        // Checks: avoid the zero edge case.
        require(fyTokenIn > 0, "HifiPool: cannot sell zero fyToken");

        underlyingOut = getQuoteForSellingFyToken(fyTokenIn);

        // Interactions
        underlying.safeTransfer(to, uint256(underlyingOut));
        fyToken.transferFrom(msg.sender, address(this), uint256(fyTokenIn));

        // TODO: check if `fyTokenIn` is not min uint256
        emit Trade(maturity, msg.sender, to, int256(underlyingOut), -int256(fyTokenIn));
    }

    /// @inheritdoc HifiPoolInterface
    function sellUnderlying(address to, uint256 underlyingIn) external override returns (uint256 fyTokenOut) {
        // Checks: avoid the zero edge case.
        require(underlyingIn > 0, "HifiPool: cannot sell zero underlying");

        fyTokenOut = getQuoteForSellingUnderlying(underlyingIn);

        // Interactions
        underlying.safeTransferFrom(msg.sender, address(this), uint256(underlyingIn));
        fyToken.transfer(to, uint256(fyTokenOut));

        // TODO: check if `underlyingIn` is not min uint256
        emit Trade(maturity, msg.sender, to, -int256(underlyingIn), int256(fyTokenOut));
    }

    /// CONSTANT INTERNAL FUNCTIONS ///

    /// @notice Downscales the normalized underlying amount to have its actual decimals of precision.
    /// @param normalizedUnderlyingAmount The underlying amount with 18 decimals of precision.
    /// @param underlyingAmount The underlying amount with its actual decimals of precision.
    function denormalize(uint256 normalizedUnderlyingAmount) internal view returns (uint256 underlyingAmount) {
        unchecked {
            underlyingAmount = underlyingPrecisionScalar != 1
                ? normalizedUnderlyingAmount / underlyingPrecisionScalar
                : normalizedUnderlyingAmount;
        }
    }

    /// @notice Upscales the underlying amount to normalized form, i.e. 18 decimals of precision.
    /// @param underlyingAmount The underlying amount with its actual decimals of precision.
    /// @param normalizedUnderlyingAmount The underlying amount with 18 decimals of precision.
    function normalize(uint256 underlyingAmount) internal view returns (uint256 normalizedUnderlyingAmount) {
        normalizedUnderlyingAmount = underlyingPrecisionScalar != 1
            ? underlyingAmount * underlyingPrecisionScalar
            : underlyingAmount;
    }
}
