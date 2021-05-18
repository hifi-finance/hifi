/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/token/erc20/Erc20.sol";
import "@paulrberg/contracts/token/erc20/Erc20Permit.sol";
import "@paulrberg/contracts/token/erc20/Erc20Recover.sol";
import "@paulrberg/contracts/utils/ReentrancyGuard.sol";

import "./IFyToken.sol";
import "./IBalanceSheet.sol";

import "./RedemptionPool.sol";
import "./Exponential.sol";

/// @title FyToken
/// @author Hifi
/// @notice Zero-coupon bond that tracks an Erc20 underlying asset.
contract FyToken is
    IFyToken, /// two dependencies
    ReentrancyGuard, /// no depedency
    Admin, /// one dependency
    Erc20, /// one dependency
    Exponential, /// two dependencies
    Erc20Permit, /// two dependencies
    Erc20Recover /// two dependencies
{
    /// STORAGE PROPERTIES ///

    /// @inheritdoc IFyToken
    IBalanceSheet public override balanceSheet;

    /// @inheritdoc IFyToken
    IErc20 public override collateral;

    /// @inheritdoc IFyToken
    uint256 public override collateralPrecisionScalar;

    /// @inheritdoc IFyToken
    uint256 public override expirationTime;

    /// @inheritdoc IFyToken
    IFintroller public override fintroller;

    /// @inheritdoc IFyToken
    IRedemptionPool public override redemptionPool;

    /// @inheritdoc IFyToken
    IErc20 public override underlying;

    /// @inheritdoc IFyToken
    uint256 public override underlyingPrecisionScalar;

    /// @inheritdoc IFyToken
    bool public constant override isFyToken = true;

    modifier isVaultOpen(address account) {
        require(balanceSheet.isVaultOpen(this, account), "VAULT_NOT_OPEN");
        _;
    }

    /// @notice The fyToken always has 18 decimals.
    /// @dev Instantiates the RedemptionPool.
    /// @param name_ Erc20 name of this token.
    /// @param symbol_ Erc20 symbol of this token.
    /// @param expirationTime_ Unix timestamp in seconds for when this token expires.
    /// @param fintroller_ The address of the Fintroller contract.
    /// @param balanceSheet_ The address of the BalanceSheet contract.
    /// @param underlying_ The contract address of the underlying asset.
    /// @param collateral_ The contract address of the collateral asset.
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 expirationTime_,
        IFintroller fintroller_,
        IBalanceSheet balanceSheet_,
        IErc20 underlying_,
        IErc20 collateral_
    ) Erc20Permit(name_, symbol_, 18) Admin() {
        uint8 defaultNumberOfDecimals = 18;

        // Set the underlying contract and calculate the decimal scalar offsets.
        uint256 underlyingDecimals = underlying_.decimals();
        require(underlyingDecimals > 0, "FYTOKEN_CONSTRUCTOR_UNDERLYING_DECIMALS_ZERO");
        require(underlyingDecimals <= defaultNumberOfDecimals, "FYTOKEN_CONSTRUCTOR_UNDERLYING_DECIMALS_OVERFLOW");
        underlyingPrecisionScalar = 10**(defaultNumberOfDecimals - underlyingDecimals);
        underlying = underlying_;

        // Set the collateral contract and calculate the decimal scalar offsets.
        uint256 collateralDecimals = collateral_.decimals();
        require(collateralDecimals > 0, "FYTOKEN_CONSTRUCTOR_COLLATERAL_DECIMALS_ZERO");
        require(defaultNumberOfDecimals >= collateralDecimals, "FYTOKEN_CONSTRUCTOR_COLLATERAL_DECIMALS_OVERFLOW");
        collateralPrecisionScalar = 10**(defaultNumberOfDecimals - collateralDecimals);
        collateral = collateral_;

        // Set the unix expiration time.
        require(expirationTime_ > block.timestamp, "FYTOKEN_CONSTRUCTOR_EXPIRATION_TIME_NOT_VALID");
        expirationTime = expirationTime_;

        // Set the Fintroller contract and sanity check it.
        fintroller = fintroller_;
        fintroller.isFintroller();

        // Set the BalanceSheet contract and sanity check it.
        balanceSheet = balanceSheet_;
        balanceSheet.isBalanceSheet();

        // Create the RedemptionPool contract and transfer the owner from the fyToken itself to the current caller.
        redemptionPool = new RedemptionPool(fintroller_, this);
        IAdmin(address(redemptionPool))._transferAdmin(msg.sender);
    }

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IFyToken
    function borrow(uint256 borrowAmount) public override isVaultOpen(msg.sender) nonReentrant returns (bool) {
        // Checks: bond not matured.
        require(isMatured() == false, "BOND_MATURED");

        // Checks: the zero edge case.
        require(borrowAmount > 0, "BORROW_ZERO");

        // Checks: the Fintroller allows this action to be performed.
        require(fintroller.getBorrowAllowed(this), "BORROW_NOT_ALLOWED");

        // Checks: debt ceiling.
        uint256 hypotheticalTotalSupply = totalSupply + borrowAmount;
        uint256 bondDebtCeiling = fintroller.getBondDebtCeiling(this);
        require(hypotheticalTotalSupply <= bondDebtCeiling, "BORROW_DEBT_CEILING_OVERFLOW");

        // Add the borrow amount to the borrower account's current debt.
        IBalanceSheet.Vault memory vault = balanceSheet.getVault(this, msg.sender);
        require(vault.lockedCollateral > 0, "BORROW_LOCKED_COLLATERAL_ZERO");
        uint256 newDebt = vault.debt + borrowAmount;

        // Checks: the hypothetical collateralization ratio is above the threshold.
        uint256 hypotheticalCollateralizationRatio =
            balanceSheet.getHypotheticalCollateralizationRatio(this, msg.sender, vault.lockedCollateral, newDebt);
        uint256 bondCollateralizationRatio = fintroller.getBondCollateralizationRatio(this);
        require(hypotheticalCollateralizationRatio >= bondCollateralizationRatio, "BELOW_COLLATERALIZATION_RATIO");

        // Effects: print the new fyTokens into existence.
        mintInternal(msg.sender, borrowAmount);

        // Emit a Mint and a Transfer event.
        emit Mint(msg.sender, borrowAmount);
        emit Transfer(address(this), msg.sender, borrowAmount);

        // Interactions: increase the debt of the borrower account.
        require(balanceSheet.increaseVaultDebt(this, msg.sender, borrowAmount), "BORROW_CALL_INCREASE_VAULT_DEBT");

        // Emit a Borrow event.
        emit Borrow(msg.sender, borrowAmount);

        return true;
    }

    /// @inheritdoc IFyToken
    function burn(address holder, uint256 burnAmount) external override nonReentrant returns (bool) {
        // Checks: the caller is the RedemptionPool.
        require(msg.sender == address(redemptionPool), "BURN_NOT_AUTHORIZED");

        // Checks: the zero edge case.
        require(burnAmount > 0, "BURN_ZERO");

        // Effects: burns the fyTokens.
        burnInternal(holder, burnAmount);

        // Emit a Burn and a Transfer event.
        emit Burn(holder, burnAmount);
        emit Transfer(holder, address(this), burnAmount);

        return true;
    }

    /// @inheritdoc IFyToken
    function liquidateBorrow(address borrower, uint256 repayAmount)
        external
        override
        isVaultOpen(borrower)
        nonReentrant
        returns (bool)
    {
        // Checks: borrowers cannot self liquidate.
        require(msg.sender != borrower, "LIQUIDATE_BORROW_SELF");

        // Checks: the zero edge case.
        require(repayAmount > 0, "LIQUIDATE_BORROW_ZERO");

        // Checks: the Fintroller allows this action to be performed.
        require(fintroller.getLiquidateBorrowAllowed(this), "LIQUIDATE_BORROW_NOT_ALLOWED");

        // After maturation, any vault can be liquidated, irrespective of collateralization ratio.
        if (isMatured() == false) {
            // Checks: the borrower fell below the threshold collateralization ratio.
            bool isAccountUnderwater = balanceSheet.isAccountUnderwater(this, borrower);
            require(isAccountUnderwater, "ACCOUNT_NOT_UNDERWATER");
        }

        // Effects & Interactions: repay the borrower's debt.
        repayBorrowInternal(msg.sender, borrower, repayAmount);

        // Interactions: clutch the collateral.
        uint256 clutchableCollateralAmount = balanceSheet.getClutchableCollateral(this, repayAmount);
        require(
            balanceSheet.clutchCollateral(this, msg.sender, borrower, clutchableCollateralAmount),
            "LIQUIDATE_BORROW_CALL_CLUTCH_COLLATERAL"
        );

        emit LiquidateBorrow(msg.sender, borrower, repayAmount, clutchableCollateralAmount);

        return true;
    }

    /// @inheritdoc IFyToken
    function mint(address beneficiary, uint256 mintAmount) external override nonReentrant returns (bool) {
        // Checks: the caller is the RedemptionPool.
        require(msg.sender == address(redemptionPool), "MINT_NOT_AUTHORIZED");

        // Checks: the zero edge case.
        require(mintAmount > 0, "MINT_ZERO");

        // Effects: print the new fyTokens into existence.
        mintInternal(beneficiary, mintAmount);

        // Emit a Mint and a Transfer event.
        emit Mint(beneficiary, mintAmount);
        emit Transfer(address(this), beneficiary, mintAmount);

        return true;
    }

    /// @inheritdoc IFyToken
    function repayBorrow(uint256 repayAmount) external override isVaultOpen(msg.sender) nonReentrant returns (bool) {
        repayBorrowInternal(msg.sender, msg.sender, repayAmount);
        return true;
    }

    /// @inheritdoc IFyToken
    function repayBorrowBehalf(address borrower, uint256 repayAmount)
        external
        override
        isVaultOpen(borrower)
        nonReentrant
        returns (bool)
    {
        repayBorrowInternal(msg.sender, borrower, repayAmount);
        return true;
    }

    /// @inheritdoc IFyToken
    function _setFintroller(IFintroller newFintroller) external override onlyAdmin returns (bool) {
        // Checks: sanity check the new Fintroller contract.
        require(newFintroller.isFintroller(), "SET_FINTROLLER_INSPECTION");

        // Effects: update storage.
        IFintroller oldFintroller = fintroller;
        fintroller = newFintroller;

        emit SetFintroller(admin, oldFintroller, newFintroller);

        return true;
    }

    /// CONSTANT FUNCTIONS ///

    /// @inheritdoc IFyToken
    function isMatured() public view override returns (bool) {
        return block.timestamp >= expirationTime;
    }

    /// INTERNAL FUNCTIONS ///

    /// @dev See the documentation for the public functions that call this internal function.
    function repayBorrowInternal(
        address payer,
        address borrower,
        uint256 repayAmount
    ) internal {
        // Checks: the zero edge case.
        require(repayAmount > 0, "REPAY_BORROW_ZERO");

        // Checks: the Fintroller allows this action to be performed.
        require(fintroller.getRepayBorrowAllowed(this), "REPAY_BORROW_NOT_ALLOWED");

        // Checks: borrower has a debt to pay.
        uint256 debt = balanceSheet.getVaultDebt(this, borrower);
        require(debt >= repayAmount, "REPAY_BORROW_INSUFFICIENT_DEBT");

        // Checks: the payer has enough fyTokens.
        require(balanceOf[payer] >= repayAmount, "REPAY_BORROW_INSUFFICIENT_BALANCE");

        // Effects: burn the fyTokens.
        burnInternal(payer, repayAmount);

        // Emit a Burn and a Transfer event.
        emit Burn(payer, repayAmount);
        emit Transfer(payer, address(this), repayAmount);

        // Interactions: decrease the debt of the borrower account.
        require(
            balanceSheet.decreaseVaultDebt(this, borrower, repayAmount),
            "REPAY_BORROW_CALL_DECREASE_VAULT_DEBT"
        );

        // Emit both a RepayBorrow event.
        uint256 newDebt = debt - repayAmount;
        emit RepayBorrow(payer, borrower, repayAmount, newDebt);
    }
}
