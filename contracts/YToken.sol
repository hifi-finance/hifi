/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./BalanceSheetInterface.sol";
import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";
import "./erc20/Erc20.sol";
import "./erc20/Erc20Permit.sol";
import "./erc20/Erc20Recover.sol";
import "./erc20/Erc20Interface.sol";
import "./math/Exponential.sol";
import "./oracles/UniswapAnchoredViewInterface.sol";
import "./utils/Admin.sol";
import "./utils/Orchestratable.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title YToken
 * @author Mainframe
 */
contract YToken is
    ReentrancyGuard, /* no depedency */
    YTokenInterface, /* one dependency */
    Admin, /* two dependencies */
    Exponential, /* two dependencies */
    Orchestratable, /* two depdendencies */
    Erc20, /* three dependencies */
    Erc20Permit, /* five dependencies */
    Erc20Recover /* five dependencies */
{
    modifier isNotMatured() {
        require(block.timestamp < expirationTime, "ERR_BOND_MATURED");
        _;
    }

    modifier isVaultOpen(address account) {
        require(balanceSheet.isVaultOpen(this, account), "ERR_VAULT_NOT_OPEN");
        _;
    }

    /**
     * @notice The yToken always has 18 decimals.
     * @param name_ Erc20 name of this token.
     * @param symbol_ Erc20 symbol of this token.
     * @param expirationTime_ Unix timestamp in seconds for when this token expires.
     * @param fintroller_ The address of the Fintroller contract.
     * @param balanceSheet_ The address of the BalanceSheet contract.
     * @param collateral_ The contract address of the collateral asset.
     * @param underlying_ The contract address of the underlying asset.
     * @param redemptionPool_ The address of the RedemptionPool contract.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 expirationTime_,
        FintrollerInterface fintroller_,
        BalanceSheetInterface balanceSheet_,
        Erc20Interface underlying_,
        Erc20Interface collateral_,
        RedemptionPoolInterface redemptionPool_
    ) Erc20Permit(name_, symbol_, 18) Admin() Orchestratable() {
        uint8 defaultNumberOfDecimals = 18;

        /* Set the unix expiration time. */
        expirationTime = expirationTime_;

        /* Set the Fintroller contract and sanity check it. */
        fintroller = fintroller_;
        fintroller.isFintroller();

        /* Set the Balance Sheet contract and sanity check it. */
        balanceSheet = balanceSheet_;
        balanceSheet.isBalanceSheet();

        /* Set the underlying and collateral contracts and calculate the decimal scalar offsets. */
        underlying = underlying_;
        require(defaultNumberOfDecimals >= underlying.decimals(), "ERR_CONSTRUCTOR_UNDERLYING_DECIMALS_OVERFLOW");
        underlyingPrecisionScalar = 1**(defaultNumberOfDecimals / underlying.decimals());

        collateral = collateral_;
        require(defaultNumberOfDecimals >= collateral.decimals(), "ERR_CONSTRUCTOR_COLLATERAL_DECIMALS_OVERFLOW");
        collateralPrecisionScalar = 1**(defaultNumberOfDecimals / collateral.decimals());

        /* Set the Redemption Pool contract and sanity check it. */
        redemptionPool = redemptionPool_;
        redemptionPool_.isRedemptionPool();
    }

    /**
     * NON-CONSTANT FUNCTIONS
     */

    struct BorrowLocalVars {
        MathError mathErr;
        uint256 collateralizationRatioMantissa;
        uint256 debt;
        uint256 debtCeiling;
        uint256 lockedCollateral;
        uint256 hypotheticalCollateralizationRatioMantissa;
        uint256 hypotheticalTotalSupply;
        uint256 newDebt;
    }

    /**
     * @notice Increases the debt of the caller and mints new yToken.
     * @dev Emits a {Borrow}, {Mint} and {Transfer} event.
     *
     * Requirements:
     *
     * - The vault must be open.
     * - Must be called prior to maturation.
     * - The amount to borrow cannot be zero.
     * - The Fintroller must allow this action to be performed.
     * - The locked collateral cannot be zero.
     * - The total supply of yTokens cannot exceed the debt ceiling.
     * - The caller must not fall below the threshold collateralization ratio.
     *
     * @param borrowAmount The amount of yTokens to borrow and print into existence.
     * @return bool true=success, otherwise it reverts.
     */
    function borrow(uint256 borrowAmount)
        public
        override
        isVaultOpen(msg.sender)
        isNotMatured
        nonReentrant
        returns (bool)
    {
        BorrowLocalVars memory vars;

        /* Checks: the zero edge case. */
        require(borrowAmount > 0, "ERR_BORROW_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.getBorrowAllowed(this), "ERR_BORROW_NOT_ALLOWED");

        /* Checks: debt ceiling. */
        (vars.mathErr, vars.hypotheticalTotalSupply) = addUInt(totalSupply, borrowAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BORROW_MATH_ERROR");
        vars.debtCeiling = fintroller.getBondDebtCeiling(this);
        require(vars.hypotheticalTotalSupply <= vars.debtCeiling, "ERR_BORROW_DEBT_CEILING_OVERFLOW");

        /* Add the borrow amount to the account's current debt. */
        (vars.debt, , vars.lockedCollateral, ) = balanceSheet.getVault(this, msg.sender);
        require(vars.lockedCollateral > 0, "ERR_BORROW_LOCKED_COLLATERAL_ZERO");
        (vars.mathErr, vars.newDebt) = addUInt(vars.debt, borrowAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BORROW_MATH_ERROR");

        /* Checks: the hypothetical collateralization ratio is above the threshold. */
        vars.hypotheticalCollateralizationRatioMantissa = balanceSheet.getHypotheticalCollateralizationRatio(
            this,
            msg.sender,
            vars.lockedCollateral,
            vars.newDebt
        );
        vars.collateralizationRatioMantissa = fintroller.getBondCollateralizationRatio(this);
        require(
            vars.hypotheticalCollateralizationRatioMantissa >= vars.collateralizationRatioMantissa,
            "ERR_BELOW_COLLATERALIZATION_RATIO"
        );

        /* Effects: print the new yTokens into existence. */
        mintInternal(msg.sender, borrowAmount);

        /* Interactions: increase the debt of the account. */
        require(balanceSheet.setVaultDebt(this, msg.sender, vars.newDebt), "ERR_BORROW_SET_VAULT_DEBT");

        /* Emit a Borrow, Mint and Transfer event. */
        emit Borrow(msg.sender, borrowAmount);
        emit Transfer(address(this), msg.sender, borrowAmount);

        return true;
    }

    /**
     * @notice Reduces the token supply by `burnAmount`.
     *
     * @dev Emits a {Burn} event.
     *
     * Requirements:
     *
     * - Must be called prior to maturation.
     * - Can only be called by the Redemption Pool, the sole ochestrated contract.
     * - The amount to burn cannot be zero.
     *
     * @param holder The account whose yTokens to burn.
     * @param burnAmount The amount of yTokens to burn.
     * @return bool true=success, otherwise it reverts.
     */
    function burn(address holder, uint256 burnAmount) external override nonReentrant onlyOrchestrated returns (bool) {
        /* Checks: the zero edge case. */
        require(burnAmount > 0, "ERR_BURN_ZERO");

        /* Effects: burns the yTokens. */
        burnInternal(holder, burnAmount);

        return true;
    }

    struct LiquidateBorrowsLocalVars {
        MathError mathErr;
        uint256 collateralizationRatioMantissa;
        uint256 lockedCollateral;
        bool isAccountUnderwater;
    }

    /**
     * @notice Pending.
     */
    function liquidateBorrow(address borrower, uint256 repayAmount)
        external
        override
        isVaultOpen(borrower)
        nonReentrant
        returns (bool)
    {
        LiquidateBorrowsLocalVars memory vars;

        /* Checks: borrowers cannot self liquidate. */
        require(msg.sender != borrower, "ERR_LIQUIDATE_BORROW_SELF");

        /* Checks: the zero edge case. */
        require(repayAmount > 0, "ERR_LIQUIDATE_BORROW_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.getLiquidateBorrowAllowed(this), "ERR_LIQUIDATE_BORROW_NOT_ALLOWED");

        /* Checks: the borrower fell below the threshold collateraliation ratio. */
        vars.isAccountUnderwater = balanceSheet.isAccountUnderwater(this, borrower);
        require(vars.isAccountUnderwater, "ERR_ACCOUNT_NOT_UNDERWATER");

        /* Effects & Interactions: repay the borrower's debt. */
        repayBorrowInternal(msg.sender, borrower, repayAmount);

        /* Checks: there is sufficient clutchable collateral in the vault. */
        uint256 lockedCollateral = balanceSheet.getVaultLockedCollateral(this, borrower);
        uint256 clutchedCollateralAmount = balanceSheet.getClutchableCollateral(this, repayAmount);
        require(lockedCollateral >= clutchedCollateralAmount, "ERR_LIQUIDATE_BORROW_CLUTCH_COLLATERAL_OVERFLOW");

        /* Interactions: clutch the collateral. */
        require(balanceSheet.clutchCollateral(this, msg.sender, borrower, clutchedCollateralAmount));

        emit LiquidateBorrow(msg.sender, borrower, repayAmount, clutchedCollateralAmount);

        return true;
    }

    /**
     * @notice Prints new yTokens into existence.
     *
     * @dev Emits a {Mint} event.
     *
     * Requirements:
     *
     * - Can only be called by the Redemption Pool, the sole ochestrated contract.
     * - The amount to mint cannot be zero.
     *
     * @param beneficiary The account for which to mint the tokens.
     * @param mintAmount The amount of yTokens to print into existence.
     * @return bool true=success, otherwise it reverts.
     */
    function mint(address beneficiary, uint256 mintAmount)
        external
        override
        nonReentrant
        onlyOrchestrated
        returns (bool)
    {
        /* Checks: the zero edge case. */
        require(mintAmount > 0, "ERR_MINT_ZERO");

        /* Effects: print the new yTokens into existence. */
        mintInternal(beneficiary, mintAmount);

        return true;
    }

    /**
     * @notice Deletes the account's debt from the registry and take the yTokens out of circulation.
     * @dev Emits a {RepayBorrow} and a {Transfer} event.
     *
     * Requirements:
     *
     * - The vault must be open.
     * - The amount to repay cannot be zero.
     * - The Fintroller must allow this action to be performed.
     * - The caller must have at least `repayAmount` yTokens.
     * - The caller must have at least `repayAmount` debt.
     *
     * @param repayAmount Lorem ipsum.
     * @return true = success, otherwise it reverts.
     */
    function repayBorrow(uint256 repayAmount) external override isVaultOpen(msg.sender) nonReentrant returns (bool) {
        repayBorrowInternal(msg.sender, msg.sender, repayAmount);

        return true;
    }

    /**
     * @notice Clears the borrower's debt from the registry and take the yTokens out of circulation.
     * @dev Emits a {RepayBorrow}, {Burn} and {Transfer} event.
     *
     * Requirements: same as the `repayBorrow` function, but here `borrower` is the account who must have
     * at least `repayAmount` yTokens to repay the borrow.
     *
     * @param borrower The account for which to repay the borrow.
     * @param repayAmount The amount of yTokens to repay.
     * @return true = success, otherwise it reverts.
     */
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

    /**
     * INTERNAL FUNCTIONS
     */
    /**
     * @dev See the documentation for the public functions that call this internal function.
     */
    function repayBorrowInternal(
        address payer,
        address borrower,
        uint256 repayAmount
    ) internal {
        /* Checks: the zero edge case. */
        require(repayAmount > 0, "ERR_REPAY_BORROW_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.getRepayBorrowAllowed(this), "ERR_REPAY_BORROW_NOT_ALLOWED");

        /* Checks: the payer has enough yTokens. */
        require(balanceOf(payer) >= repayAmount, "ERR_REPAY_BORROW_INSUFFICIENT_BALANCE");

        /* Checks: account has a debt to pay. */
        uint256 debt = balanceSheet.getVaultDebt(this, borrower);
        require(debt >= repayAmount, "ERR_REPAY_BORROW_INSUFFICIENT_DEBT");

        /* Effects: reduce the debt of the account. */
        MathError mathErr;
        uint256 newDebt;
        (mathErr, newDebt) = subUInt(debt, repayAmount);
        /* This operation can't fail because of the previous `require`. */
        assert(mathErr == MathError.NO_ERROR);

        /* Effects: burn the yTokens. */
        burnInternal(payer, repayAmount);

        /* Interactions: reduce the debt of the account. */
        require(balanceSheet.setVaultDebt(this, borrower, newDebt));

        /* Emit a RepayBorrow and Transfer event. */
        emit RepayBorrow(payer, borrower, repayAmount, newDebt);
        emit Transfer(payer, address(this), repayAmount);
    }
}
