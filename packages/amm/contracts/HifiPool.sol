// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/h-token/IHToken.sol";
import "@prb/contracts/token/erc20/Erc20.sol";
import "@prb/contracts/token/erc20/IErc20.sol";
import "@prb/contracts/token/erc20/Erc20Permit.sol";
import "@prb/contracts/token/erc20/SafeErc20.sol";

import "./IHifiPool.sol";
import "./math/YieldSpace.sol";

/// @title HifiPool
/// @author Hifi
contract HifiPool is
    IHifiPool, // no dependency
    Erc20, // one dependency
    Erc20Permit // four dependencies
{
    using SafeErc20 for IErc20;

    /// @inheritdoc IHifiPool
    IHToken public override hToken;

    /// @inheritdoc IHifiPool
    uint256 public override maturity;

    /// @inheritdoc IHifiPool
    IErc20 public override underlying;

    /// @inheritdoc IHifiPool
    uint256 public override underlyingPrecisionScalar;

    /// @inheritdoc IHifiPool
    uint256 public constant override MINIMUM_LIQUIDITY = 10**3;

    /// @dev Trading can only occur prior to maturity.
    modifier isBeforeMaturity() {
        if (block.timestamp >= maturity) {
            revert HifiPool__BondMatured();
        }
        _;
    }

    /// @notice Instantiates the HifiPool contract.
    /// @dev The LP token always has 18 decimals.
    /// @param name_ Erc20 name of this LP token.
    /// @param symbol_ Erc20 symbol of this LP token.
    /// @param hToken_ The address of the hToken contract.
    constructor(
        string memory name_,
        string memory symbol_,
        IHToken hToken_
    ) Erc20Permit(name_, symbol_, 18) {
        hToken = hToken_;
        underlying = hToken.underlying();
        underlyingPrecisionScalar = hToken.underlyingPrecisionScalar();
        maturity = hToken_.maturity();
    }

    /// PUBLIC CONSTANT FUNCTIONS ///

    /// @inheritdoc IHifiPool
    function getBurnOutputs(uint256 poolTokensBurned)
        public
        view
        override
        returns (uint256 underlyingReturned, uint256 hTokenReturned)
    {
        uint256 supply = totalSupply;
        uint256 normalizedUnderlyingReserves = getNormalizedUnderlyingReserves();

        // Use the actual reserves rather than the virtual reserves.
        uint256 hTokenReserves = hToken.balanceOf(address(this));
        uint256 normalizedUnderlyingReturned = (poolTokensBurned * normalizedUnderlyingReserves) / supply;
        underlyingReturned = denormalize(normalizedUnderlyingReturned);
        hTokenReturned = (poolTokensBurned * hTokenReserves) / supply;
    }

    /// @inheritdoc IHifiPool
    function getMintInputs(uint256 underlyingOffered)
        public
        view
        override
        returns (uint256 hTokenRequired, uint256 poolTokensMinted)
    {
        // Our precision is 18 decimals so the underlying amount needs to be normalized.
        uint256 normalizedUnderlyingOffered = normalize(underlyingOffered);
        uint256 supply = totalSupply;

        // When there are no LP tokens in existence, only underlying needs to be provided.
        if (supply == 0) {
            return (0, normalizedUnderlyingOffered);
        }

        // We need to use the actual reserves rather than the virtual reserves here.
        uint256 hTokenReserves = hToken.balanceOf(address(this));
        poolTokensMinted = (supply * normalizedUnderlyingOffered) / getNormalizedUnderlyingReserves();
        hTokenRequired = (hTokenReserves * poolTokensMinted) / supply;
    }

    /// @inheritdoc IHifiPool
    function getQuoteForBuyingHToken(uint256 hTokenOut)
        public
        view
        override
        isBeforeMaturity
        returns (uint256 underlyingIn)
    {
        uint256 virtualHTokenReserves = getVirtualHTokenReserves();
        uint256 normalizedUnderlyingReserves = getNormalizedUnderlyingReserves();
        uint256 normalizedUnderlyingIn;
        unchecked {
            normalizedUnderlyingIn = YieldSpace.underlyingInForHTokenOut(
                virtualHTokenReserves,
                normalizedUnderlyingReserves,
                hTokenOut,
                maturity - block.timestamp
            );
            if (virtualHTokenReserves - hTokenOut < normalizedUnderlyingReserves + normalizedUnderlyingIn) {
                revert HifiPool__NegativeInterestRate(
                    virtualHTokenReserves,
                    hTokenOut,
                    normalizedUnderlyingReserves,
                    normalizedUnderlyingIn
                );
            }
        }
        underlyingIn = denormalize(normalizedUnderlyingIn);
    }

    /// @inheritdoc IHifiPool
    function getQuoteForBuyingUnderlying(uint256 underlyingOut)
        public
        view
        override
        isBeforeMaturity
        returns (uint256 hTokenIn)
    {
        unchecked {
            hTokenIn = YieldSpace.hTokenInForUnderlyingOut(
                getNormalizedUnderlyingReserves(),
                getVirtualHTokenReserves(),
                normalize(underlyingOut),
                maturity - block.timestamp
            );
        }
    }

    /// @inheritdoc IHifiPool
    function getQuoteForSellingHToken(uint256 hTokenIn)
        public
        view
        override
        isBeforeMaturity
        returns (uint256 underlyingOut)
    {
        unchecked {
            uint256 normalizedUnderlyingOut = YieldSpace.underlyingOutForHTokenIn(
                getVirtualHTokenReserves(),
                getNormalizedUnderlyingReserves(),
                hTokenIn,
                maturity - block.timestamp
            );
            underlyingOut = denormalize(normalizedUnderlyingOut);
        }
    }

    /// @inheritdoc IHifiPool
    function getQuoteForSellingUnderlying(uint256 underlyingIn)
        public
        view
        override
        isBeforeMaturity
        returns (uint256 hTokenOut)
    {
        uint256 normalizedUnderlyingReserves = getNormalizedUnderlyingReserves();
        uint256 virtualHTokenReserves = getVirtualHTokenReserves();
        uint256 normalizedUnderlyingIn = normalize(underlyingIn);
        unchecked {
            hTokenOut = YieldSpace.hTokenOutForUnderlyingIn(
                normalizedUnderlyingReserves,
                virtualHTokenReserves,
                normalizedUnderlyingIn,
                maturity - block.timestamp
            );
            if (virtualHTokenReserves - hTokenOut < normalizedUnderlyingReserves + normalizedUnderlyingIn) {
                revert HifiPool__NegativeInterestRate(
                    virtualHTokenReserves,
                    hTokenOut,
                    normalizedUnderlyingReserves,
                    normalizedUnderlyingIn
                );
            }
        }
    }

    /// @inheritdoc IHifiPool
    function getNormalizedUnderlyingReserves() public view override returns (uint256 normalizedUnderlyingReserves) {
        normalizedUnderlyingReserves = normalize(underlying.balanceOf(address(this)));
    }

    /// @inheritdoc IHifiPool
    function getVirtualHTokenReserves() public view override returns (uint256 virtualHTokenReserves) {
        unchecked {
            uint256 hTokenBalance = hToken.balanceOf(address(this));
            virtualHTokenReserves = hTokenBalance + totalSupply;
            if (virtualHTokenReserves < hTokenBalance) {
                revert HifiPool__VirtualHTokenReservesOverflow(hTokenBalance, totalSupply);
            }
        }
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IHifiPool
    function burn(uint256 poolTokensBurned)
        external
        override
        returns (uint256 underlyingReturned, uint256 hTokenReturned)
    {
        // Checks: avoid the zero edge case.
        if (poolTokensBurned == 0) {
            revert HifiPool__BurnZero();
        }

        (underlyingReturned, hTokenReturned) = getBurnOutputs(poolTokensBurned);

        // Effects
        burnInternal(msg.sender, poolTokensBurned);

        // Interactions
        underlying.safeTransfer(msg.sender, underlyingReturned);
        if (hTokenReturned > 0) {
            hToken.transfer(msg.sender, hTokenReturned);
        }

        emit RemoveLiquidity(maturity, msg.sender, underlyingReturned, hTokenReturned, poolTokensBurned);
    }

    /// @inheritdoc IHifiPool
    function buyHToken(address to, uint256 hTokenOut) external override returns (uint256 underlyingIn) {
        // Checks: avoid the zero edge case.
        if (hTokenOut == 0) {
            revert HifiPool__BuyHTokenZero();
        }

        underlyingIn = getQuoteForBuyingHToken(hTokenOut);

        // Checks: avoid the zero edge case.
        if (underlyingIn == 0) {
            revert HifiPool__BuyHTokenUnderlyingZero();
        }

        // Interactions
        underlying.safeTransferFrom(msg.sender, address(this), underlyingIn);
        hToken.transfer(to, hTokenOut);

        emit Trade(maturity, msg.sender, to, -toInt256(underlyingIn), toInt256(hTokenOut));
    }

    /// @inheritdoc IHifiPool
    function buyUnderlying(address to, uint256 underlyingOut) external override returns (uint256 hTokenIn) {
        // Checks: avoid the zero edge case.
        if (underlyingOut == 0) {
            revert HifiPool__BuyUnderlyingZero();
        }

        hTokenIn = getQuoteForBuyingUnderlying(underlyingOut);

        // Interactions
        hToken.transferFrom(msg.sender, address(this), hTokenIn);
        underlying.safeTransfer(to, underlyingOut);

        emit Trade(maturity, msg.sender, to, toInt256(underlyingOut), -toInt256(hTokenIn));
    }

    /// @inheritdoc IHifiPool
    function mint(uint256 underlyingOffered) external override isBeforeMaturity returns (uint256 poolTokensMinted) {
        // Checks: avoid the zero edge case.
        if (underlyingOffered == 0) {
            revert HifiPool__MintZero();
        }

        uint256 hTokenRequired;
        (hTokenRequired, poolTokensMinted) = getMintInputs(underlyingOffered);

        // Effects
        if (totalSupply == 0) {
            if (poolTokensMinted < MINIMUM_LIQUIDITY) {
                revert HifiPool__MintMinimumLiquidity();
            }
            poolTokensMinted -= MINIMUM_LIQUIDITY;
            // Permanently lock the first minimum liquidity tokens.
            mintInternal(address(1), MINIMUM_LIQUIDITY);
        }
        mintInternal(msg.sender, poolTokensMinted);

        // Interactions
        underlying.safeTransferFrom(msg.sender, address(this), underlyingOffered);
        if (hTokenRequired > 0) {
            hToken.transferFrom(msg.sender, address(this), hTokenRequired);
        }

        emit AddLiquidity(maturity, msg.sender, underlyingOffered, hTokenRequired, poolTokensMinted);
    }

    /// @inheritdoc IHifiPool
    function sellHToken(address to, uint256 hTokenIn) external override returns (uint256 underlyingOut) {
        // Checks: avoid the zero edge case.
        if (hTokenIn == 0) {
            revert HifiPool__SellHTokenZero();
        }

        underlyingOut = getQuoteForSellingHToken(hTokenIn);

        // Checks: avoid the zero edge case.
        if (underlyingOut == 0) {
            revert HifiPool__SellHTokenUnderlyingZero();
        }

        // Interactions
        hToken.transferFrom(msg.sender, address(this), hTokenIn);
        underlying.safeTransfer(to, underlyingOut);

        emit Trade(maturity, msg.sender, to, toInt256(underlyingOut), -toInt256(hTokenIn));
    }

    /// @inheritdoc IHifiPool
    function sellUnderlying(address to, uint256 underlyingIn) external override returns (uint256 hTokenOut) {
        // Checks: avoid the zero edge case.
        if (underlyingIn == 0) {
            revert HifiPool__SellUnderlyingZero();
        }

        hTokenOut = getQuoteForSellingUnderlying(underlyingIn);

        // Interactions
        underlying.safeTransferFrom(msg.sender, address(this), underlyingIn);
        hToken.transfer(to, hTokenOut);

        emit Trade(maturity, msg.sender, to, -toInt256(underlyingIn), toInt256(hTokenOut));
    }

    /// INTERNAL CONSTANT FUNCTIONS ///

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

    /// @notice Safe cast from uint256 to int256
    function toInt256(uint256 x) internal pure returns (int256 result) {
        if (x > uint256(type(int256).max)) {
            revert HifiPool__ToInt256CastOverflow(x);
        }
        result = int256(x);
    }
}
