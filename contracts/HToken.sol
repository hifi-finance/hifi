/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/token/erc20/Erc20.sol";
import "@paulrberg/contracts/token/erc20/Erc20Permit.sol";
import "@paulrberg/contracts/token/erc20/Erc20Recover.sol";
import "@paulrberg/contracts/utils/ReentrancyGuard.sol";

import "./IBalanceSheetV1.sol";
import "./IHToken.sol";

/// @title HToken
/// @author Hifi
contract HToken is
    ReentrancyGuard, // no dependency
    Admin, // one dependency
    Erc20, // one dependency
    Erc20Permit, // four dependencies
    IHToken, // five dependencies
    Erc20Recover // five dependencies
{
    /// STORAGE ///

    /// @inheritdoc IHToken
    IBalanceSheetV1 public override balanceSheet;

    /// @inheritdoc IHToken
    uint256 public override expirationTime;

    /// @inheritdoc IHToken
    IErc20 public override underlying;

    /// @inheritdoc IHToken
    uint256 public override underlyingPrecisionScalar;

    /// CONSTRUCTOR ///

    /// @notice The hToken always has 18 decimals.
    /// @param name_ Erc20 name of this token.
    /// @param symbol_ Erc20 symbol of this token.
    /// @param expirationTime_ Unix timestamp in seconds for when this token expires.
    /// @param balanceSheet_ The address of the BalanceSheet contract.
    /// @param underlying_ The contract address of the underlying asset.
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 expirationTime_,
        IBalanceSheetV1 balanceSheet_,
        IErc20 underlying_
    ) Erc20Permit(name_, symbol_, 18) Admin() {
        // Set the unix expiration time.
        require(expirationTime_ > block.timestamp, "HTOKEN_CONSTRUCTOR_EXPIRATION_TIME_PAST");
        expirationTime = expirationTime_;

        // Set the BalanceSheet contract.
        balanceSheet = balanceSheet_;

        // Set the underlying contract and calculate the decimal scalar offsets.
        uint256 underlyingDecimals = underlying_.decimals();
        require(underlyingDecimals > 0, "HTOKEN_CONSTRUCTOR_UNDERLYING_DECIMALS_ZERO");
        require(underlyingDecimals <= 18, "HTOKEN_CONSTRUCTOR_UNDERLYING_DECIMALS_OVERFLOW");
        underlyingPrecisionScalar = 10**(18 - underlyingDecimals);
        underlying = underlying_;
    }

    /// PUBLIC CONSTANT FUNCTIONS ///

    /// @inheritdoc IHToken
    function isMatured() public view override returns (bool) {
        return block.timestamp >= expirationTime;
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IHToken
    function burn(address holder, uint256 burnAmount) external override nonReentrant {
        // Checks: the caller is the BalanceSheet.
        require(msg.sender == address(balanceSheet), "BURN_NOT_AUTHORIZED");

        // Checks: the zero edge case.
        require(burnAmount > 0, "BURN_ZERO");

        // Effects: burns the hTokens.
        burnInternal(holder, burnAmount);

        // Emit a Burn and a Transfer event.
        emit Burn(holder, burnAmount);
        emit Transfer(holder, address(this), burnAmount);
    }

    /// @inheritdoc IHToken
    function mint(address beneficiary, uint256 mintAmount) external override nonReentrant {
        // Checks: the caller is the BalanceSheet.
        require(msg.sender == address(balanceSheet), "MINT_NOT_AUTHORIZED");

        // Checks: the zero edge case.
        require(mintAmount > 0, "MINT_ZERO");

        // Effects: print the new hTokens into existence.
        mintInternal(beneficiary, mintAmount);

        // Emit a Mint and a Transfer event.
        emit Mint(beneficiary, mintAmount);
        emit Transfer(address(this), beneficiary, mintAmount);
    }

    /// @inheritdoc IHToken
    function _setBalanceSheet(IBalanceSheetV1 newBalanceSheet) external override onlyAdmin {
        // Effects: update storage.
        IBalanceSheetV1 oldBalanceSheet = balanceSheet;
        balanceSheet = newBalanceSheet;

        emit SetBalanceSheet(admin, oldBalanceSheet, newBalanceSheet);
    }
}
