/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./BalanceSheetInterface.sol";
import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";
import "./erc20/Erc20.sol";
import "./erc20/Erc20Interface.sol";
import "./math/Exponential.sol";
import "./pricing/SimpleOracleInterface.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";
import "./utils/Orchestratable.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title YToken
 * @author Mainframe
 */
contract YToken is YTokenInterface, Erc20, Admin, Orchestratable, ErrorReporter, Exponential, ReentrancyGuard {
    modifier isMatured() {
        require(block.timestamp >= expirationTime, "ERR_BOND_NOT_MATURED");
        _;
    }

    modifier isNotMatured() {
        require(block.timestamp < expirationTime, "ERR_BOND_MATURED");
        _;
    }

    modifier isVaultOpen(address user) {
        require(balanceSheet.isVaultOpen(this, user), "ERR_VAULT_NOT_OPEN");
        _;
    }

    /**
     * @dev This implementation assumes that the yToken has the same number of decimals as the underlying.
     * @param name_ Erc20 name of this token.
     * @param symbol_ Erc20 symbol of this token.
     * @param decimals_ Erc20 decimal precision of this token.
     * @param expirationTime_ Unix timestamp in seconds for when this token expires.
     * @param balanceSheet_ The address of the BalanceSheet contract.
     * @param fintroller_ The address of the Fintroller contract.
     * @param underlying_ The contract address of the underlying asset.
     * @param collateral_ The contract address of the collateral asset.
     * @param guarantorPool_ The address of the GuarantorPool contract.
     * @param redemptionPool_ The address of the RedemptionPool contract.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 expirationTime_,
        BalanceSheetInterface balanceSheet_,
        FintrollerInterface fintroller_,
        Erc20Interface underlying_,
        Erc20Interface collateral_,
        address guarantorPool_,
        RedemptionPoolInterface redemptionPool_
    ) public Erc20(name_, symbol_, decimals_) Admin() Orchestratable() {
        /* Set the unix expiration time. */
        expirationTime = expirationTime_;

        /* Set the Balance Sheet contract and sanity check it. */
        balanceSheet = balanceSheet_;
        balanceSheet.isBalanceSheet();

        /* Set the Fintroller contract and sanity check it. */
        fintroller = fintroller_;
        fintroller.isFintroller();

        /* Set the underlying and collateral contracts and sanity check them. */
        underlying = underlying_;
        Erc20Interface(underlying_).totalSupply();

        collateral = collateral_;
        Erc20Interface(collateral_).totalSupply();

        /* Set the Redemption Pool contract and sanity check it. */
        redemptionPool_.isRedemptionPool();
        redemptionPool = redemptionPool_;

        /* Set the Guarantor Pool contract. */
        guarantorPool = guarantorPool_;
    }

    /*** View Functions ***/

    /**
     * @notice Returns the number of seconds left before the yToken expires.
     * @dev Also useful for stubbing in testing.
     * @return uint256=number of seconds if not expired or zero if expired, otherwise it reverts.
     */
    function timeToLive() public override view returns (uint256) {
        if (expirationTime > block.timestamp) {
            return expirationTime - block.timestamp;
        } else {
            return 0;
        }
    }

    /*** Non-Constant Functions ***/

    struct BorrowLocalVars {
        MathError mathErr;
        uint256 debt;
        uint256 lockedCollateral;
        uint256 lockedCollateralValueInUsd;
        uint256 borrowValueInUsd;
        Exp newCollateralizationRatio;
        uint256 newDebt;
        uint256 thresholdCollateralizationRatioMantissa;
    }

    /**
     * @notice Increases the debt of the caller and mints new yToken.
     * @dev Emits a {Borrow} and a {Transfer} event.
     *
     * Requirements:
     *
     * - The vault must be open.
     * - Must be called before maturation.
     * - The amount to borrow cannot be zero.
     * - The Fintroller must allow borrows.
     * - The caller must not fall below the threshold collateralization ratio.
     *
     * @param borrowAmount The amount of yTokens to borrow and print into existence.
     * @return bool true=success, otherwise it reverts.
     */
    function borrow(uint256 borrowAmount) public override isVaultOpen(msg.sender) isNotMatured returns (bool) {
        BorrowLocalVars memory vars;

        /* Checks: the zero edge case. */
        require(borrowAmount > 0, "ERR_BORROW_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.borrowAllowed(this), "ERR_BORROW_NOT_ALLOWED");

        /* TODO: check liquidity in the Guarantor Pool and Redemption Pool. */

        /* Checks: the new collateralization ratio is higher or equal to the threshold. */
        (vars.debt, , vars.lockedCollateral, ) = balanceSheet.getVault(this, msg.sender);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BORROW_MATH_ERROR");

        SimpleOracleInterface oracle = fintroller.oracle();
        (vars.mathErr, vars.lockedCollateralValueInUsd) = oracle.multiplyCollateralAmountByItsPriceInUsd(
            vars.lockedCollateral
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BORROW_MATH_ERROR");

        (vars.mathErr, vars.borrowValueInUsd) = oracle.multiplyUnderlyingAmountByItsPriceInUsd(borrowAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BORROW_MATH_ERROR");

        (vars.mathErr, vars.newDebt) = addUInt(vars.debt, vars.borrowValueInUsd);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BORROW_MATH_ERROR");

        (vars.mathErr, vars.newCollateralizationRatio) = divExp(
            Exp({ mantissa: vars.lockedCollateralValueInUsd }),
            Exp({ mantissa: vars.newDebt })
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BORROW_MATH_ERROR");

        (vars.thresholdCollateralizationRatioMantissa) = fintroller.getBond(address(this));
        require(
            vars.newCollateralizationRatio.mantissa >= vars.thresholdCollateralizationRatioMantissa,
            "ERR_BELOW_THRESHOLD_COLLATERALIZATION_RATIO"
        );

        /* Effects: print the new yTokens into existence. */
        mintInternal(msg.sender, borrowAmount);

        /* Interactions: increase the debt of the user. */
        require(balanceSheet.setVaultDebt(this, msg.sender, vars.newDebt), "ERR_BORROW_SET_VAULT_DEBT");

        /* Emit both a Borrow and a Transfer event. */
        emit Borrow(msg.sender, borrowAmount);
        emit Transfer(address(this), msg.sender, borrowAmount);

        return NO_ERROR;
    }

    function liquidateBorrow(address borrower, uint256 repayUnderlyingAmount)
        external
        override
        isVaultOpen(borrower)
        returns (bool)
    {
        borrower;
        repayUnderlyingAmount;
        return NO_ERROR;
    }

    /**
     * @dev Emits a {Mint} event.
     *
     * Requirements:
     * - Must be called before maturation.
     * - Can only be called by the Redemption Pool, the sole ochestrated contract.
     * - The amount to mint cannot be zero.
     *
     * @param beneficiary The user for whom to mint the tokens.
     * @param mintAmount The amount of yTokens to print into existence.
     */
    function mint(address beneficiary, uint256 mintAmount)
        external
        override
        isNotMatured
        onlyOrchestrated
        returns (bool)
    {
        /* Checks: the zero edge case. */
        require(mintAmount > 0, "ERR_MINT_ZERO");

        /* Effects: print the new yTokens into existence. */
        mintInternal(beneficiary, mintAmount);

        emit Mint(beneficiary, mintAmount);

        return NO_ERROR;
    }

    /**
     * @notice Deletes the user's debt from the registry and take the yTokens out of circulation.
     * @dev Emits a {RepayBorrow} and a {Transfer} event.
     *
     * Requirements:
     * - The vault must be open.
     * - The amount to repay cannot be zero.
     * - The caller must have at least `repayAmount` yTokens.
     * - The caller must have at least `repayAmount` as debt yTokens.
     * - The caller cannot fall below the threshold collateralization ratio.
     *
     * @param repayAmount Lorem ipsum.
     * @return bool=success, otherwise it reverts.
     */
    function repayBorrow(uint256 repayAmount) external override isVaultOpen(msg.sender) nonReentrant returns (bool) {
        repayBorrowInternal(msg.sender, msg.sender, repayAmount);

        /* Emit both a RepayBorrow and a Transfer event. */
        emit RepayBorrow(msg.sender, msg.sender, repayAmount);
        emit Transfer(msg.sender, address(this), repayAmount);

        return NO_ERROR;
    }

    /**
     * @notice Deletes the borrower's debt from the registry and take the yTokens out of circulation.
     * @dev Emits a {RepayBorrow}, {RepayBorrowBehalf} and a {Transfer} event.
     *
     * Requirements: same as the `repayBorrow` function, but here `borrower` is the user who must have
     * at least `repayAmount` yTokens to repay the borrow.
     *
     * @param borrower The account for whom to repay the borrow.
     * @param repayAmount The amount of yTokens to repay.
     * @return bool=success, otherwise it reverts.
     */
    function repayBorrowBehalf(address borrower, uint256 repayAmount)
        external
        override
        isVaultOpen(borrower)
        nonReentrant
        returns (bool)
    {
        repayBorrowInternal(msg.sender, borrower, repayAmount);

        /* Emit a RepayBorrow and a Transfer event. */
        emit RepayBorrow(msg.sender, borrower, repayAmount);
        emit Transfer(msg.sender, address(this), repayAmount);

        return NO_ERROR;
    }

    /*** Internal Functions ***/
    struct BurnInternalLocalVars {
        MathError mathErr;
        uint256 newHolderBalance;
        uint256 newTotalSupply;
    }

    /**
     * @dev See the documentation for the public functions that call this internal function.
     */
    function burnInternal(address holder, uint256 burnAmount) internal {
        BurnInternalLocalVars memory vars;

        /* Effects: reduce the yToken supply. */
        (vars.mathErr, vars.newTotalSupply) = subUInt(totalSupply, burnAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BURN_UNDERFLOW_TOTAL_SUPPLY");
        totalSupply = vars.newTotalSupply;

        /* Effects: burn the yTokens. */
        (vars.mathErr, vars.newHolderBalance) = subUInt(balances[holder], burnAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BURN_INSUFFICIENT_BALANCE");
        balances[holder] = vars.newHolderBalance;
    }

    struct RepayBorrowInternalLocalVars {
        MathError mathErr;
        uint256 debt;
        uint256 newPayerBalance;
        uint256 newDebt;
        uint256 newTotalSupply;
    }

    /**
     * @dev See the documentation for the public functions that call this internal function.
     */
    function repayBorrowInternal(
        address payer,
        address borrower,
        uint256 repayAmount
    ) internal {
        RepayBorrowInternalLocalVars memory vars;

        /* Checks: the zero edge case. */
        require(repayAmount > 0, "ERR_REPAY_BORROW_ZERO");

        /* Checks: verify that the Fintroller allows this action to be performed. */
        require(fintroller.repayBorrowAllowed(this), "ERR_REPAY_BORROW_NOT_ALLOWED");

        /* Checks: the payer has enough yTokens. */
        require(balanceOf(payer) >= repayAmount, "ERR_REPAY_BORROW_INSUFFICIENT_BALANCE");

        /* Checks: user has a debt to pay. */
        (vars.debt, , , ) = balanceSheet.getVault(this, borrower);
        require(vars.debt >= repayAmount, "ERR_REPAY_BORROW_INSUFFICIENT_DEBT");

        /* Effects: reduce the debt of the user. */
        (vars.mathErr, vars.newDebt) = subUInt(vars.debt, repayAmount);
        /* This operation can't fail because of the previous `require`. */
        assert(vars.mathErr == MathError.NO_ERROR);

        /* Effects: burn the yTokens. */
        burnInternal(payer, repayAmount);

        /* Interactions: reduce the debt of the user. */
        require(balanceSheet.setVaultDebt(this, borrower, vars.newDebt), "ERR_REPAY_BORROW_SET_VAULT_DEBT");
    }

    struct MintInternalLocalVars {
        MathError mathErr;
        uint256 newBeneficiaryBalance;
        uint256 newTotalSupply;
    }

    /**
     * @dev See the documentation for the public functions that call this internal function.
     */
    function mintInternal(address beneficiary, uint256 mintAmount) internal {
        MintInternalLocalVars memory vars;

        /* Increase the yToken supply. */
        (vars.mathErr, vars.newTotalSupply) = addUInt(totalSupply, mintAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_OVERFLOW_TOTAL_SUPPLY");
        totalSupply = vars.newTotalSupply;

        /* Mint the yTokens. */
        (vars.mathErr, vars.newBeneficiaryBalance) = addUInt(balances[beneficiary], mintAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_OVERFLOW_BALANCE");
        balances[beneficiary] = vars.newBeneficiaryBalance;
    }
}
