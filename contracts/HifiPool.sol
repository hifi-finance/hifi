// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@hifi/protocol/contracts/FyTokenInterface.sol";
import "@paulrberg/contracts/token/erc20/Erc20.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";
import "@paulrberg/contracts/token/erc20/Erc20Permit.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";

import "./HifiPoolInterface.sol";

contract HifiPool is
    Erc20, /// two dependencies
    HifiPoolInterface, /// one dependency
    Erc20Permit /// five dependencies
{
    using SafeErc20 for Erc20Interface;
    using SafeErc20 for FyTokenInterface;

    /// @dev Trading can only occur prior to maturity.
    modifier isBeforeMaturity() {
        require(block.timestamp < maturity, "ERR_BOND_MATURED");
        _;
    }

    constructor(
        Erc20Interface underlying_,
        FyTokenInterface fyToken_,
        string memory name_,
        string memory symbol_
    ) Erc20Permit(name_, symbol_, 18) {
        underlying = underlying_;
        fyToken = fyToken_;
        maturity = fyToken_.expirationTime();
    }

    /// CONSTANT FUNCTIONS ///

    /// @inheritdoc HifiPoolInterface
    function getFyTokenQuote(uint256 fyTokenOut) public view override isBeforeMaturity returns (uint256) {
        uint256 underlyingReserves = underlying.balanceOf(address(this));
        uint256 virtualFyTokenReserves = getVirtualFyTokenReserves();
        uint256 timeToMaturity = maturity - block.timestamp;

        return 0;

        // uint256 underlyingIn =
        //     YieldSpace.underlyingInForFyTokenOut(
        //         underlyingReserves,
        //         virtualFyTokenReserves,
        //         fyTokenOut,
        //         timeToMaturity,
        //         g1
        //     );
        // require(
        //     virtualFyTokenReserves - fyTokenOut >= underlyingReserves + underlyingIn,
        //     "ERR_FY_TOKEN_RESERVES_TOO_LOW"
        // );

        // return underlyingIn;
    }

    /// @inheritdoc HifiPoolInterface
    function getUnderlyingQuote(uint256 underlyingOut) public view override isBeforeMaturity returns (uint256) {
        uint256 underlyingReserves = underlying.balanceOf(address(this));
        uint256 virtualFyTokenReserves = getVirtualFyTokenReserves();
        uint256 timeToMaturity = maturity - block.timestamp;

        return 0;

        // YieldSpace.fyTokenInForUnderlyingOut(
        //     underlyingReserves,
        //     virtualFyTokenReserves,
        //     underlyingOut,
        //     timeToMaturity,
        //     g2
        // );
    }

    /// @inheritdoc HifiPoolInterface
    function getVirtualFyTokenReserves() public view override returns (uint256) {
        return fyToken.balanceOf(address(this)) + totalSupply;
    }

    /// NON-CONSTANT EXTERNAL FUNCTIONS ///

    /// @inheritdoc HifiPoolInterface
    function burn(uint256 poolTokensBurned) external override returns (uint256, uint256) {
        // Checks: avoid the zero edge case.
        require(poolTokensBurned > 0, "ERR_GET_CLUTCHABLE_COLLATERAL_ZERO");

        uint256 supply = totalSupply;
        uint256 underlyingReserves = underlying.balanceOf(address(this));

        // Use the actual reserves rather than the virtual reserves.
        uint256 underlyingReturned;
        uint256 fyTokenReturned;
        {
            // Avoiding stack too deep.
            uint256 fyTokenReserves = fyToken.balanceOf(address(this));
            underlyingReturned = (poolTokensBurned * underlyingReserves) / supply;
            fyTokenReturned = (poolTokensBurned * fyTokenReserves) / supply;
        }

        // Effects
        burnInternal(msg.sender, poolTokensBurned);

        // Interactions
        underlying.transfer(msg.sender, underlyingReturned);
        fyToken.transfer(msg.sender, fyTokenReturned);

        emit RemoveLiquidity(maturity, msg.sender, underlyingReturned, fyTokenReturned, poolTokensBurned);

        return (underlyingReturned, fyTokenReturned);
    }

    /// @inheritdoc HifiPoolInterface
    function mint(uint256 underlyingOffered) external override returns (uint256) {
        uint256 supply = totalSupply;
        if (supply == 0) {
            return initialize(underlyingOffered);
        }

        uint256 underlyingReserves = underlying.balanceOf(address(this));
        // Use the actual reserves rather than the virtual reserves.
        uint256 fyTokenReserves = fyToken.balanceOf(address(this));
        uint256 poolTokensMinted = (supply * underlyingOffered) / underlyingReserves;
        uint256 fyTokenRequired = (fyTokenReserves * poolTokensMinted) / supply;

        // Effects
        mintInternal(msg.sender, poolTokensMinted);

        // Interactions
        underlying.safeTransferFrom(msg.sender, address(this), underlyingOffered);
        fyToken.safeTransferFrom(msg.sender, address(this), fyTokenRequired);

        emit AddLiquidity(maturity, msg.sender, underlyingOffered, fyTokenRequired, poolTokensMinted);

        return poolTokensMinted;
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
    /// @return The amount of liquidity tokens minted.
    function initialize(uint256 underlyingAmount) internal isBeforeMaturity returns (uint256) {
        // Checks
        require(totalSupply == 0, "ERR_INITALIZED");

        // Effects
        mintInternal(msg.sender, underlyingAmount);

        // Interactions
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        emit AddLiquidity(maturity, msg.sender, underlyingAmount, 0, underlyingAmount);

        return underlyingAmount;
    }
}
