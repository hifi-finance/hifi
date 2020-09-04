/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";
import "./erc20/Erc20.sol";
import "./erc20/Erc20Interface.sol";
import "./math/Exponential.sol";
import "./pricing/SimpleOracleInterface.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title YToken
 * @author Mainframe
 */
contract YToken is YTokenInterface, Erc20, Admin, Exponential, ErrorReporter, ReentrancyGuard {
    modifier isMatured() {
        require(block.timestamp >= expirationTime, "ERR_BOND_NOT_MATURED");
        _;
    }

    modifier isNotMatured() {
        require(block.timestamp < expirationTime, "ERR_BOND_MATURED");
        _;
    }

    modifier isVaultOpen() {
        require(vaults[msg.sender].isOpen, "ERR_VAULT_NOT_OPEN");
        _;
    }

    /**
     * @dev This implementation assumes that the yToken has the same number of decimals as the underlying.
     * @param name_ Erc20 name of this token.
     * @param symbol_ Erc20 symbol of this token.
     * @param decimals_ Erc20 decimal precision of this token.
     * @param fintroller_ The address of the fintroller contract.
     * @param underlying_ The contract address of the underlying asset.
     * @param collateral_ The contract address of the totalCollateral asset.
     * @param guarantorPool_ The pool where Guarantors deploy their capital to.
     * @param guarantorPool_ The pool where the redeemable underlying is stored.
     * @param expirationTime_ Unix timestamp in seconds for when this token expires.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        FintrollerInterface fintroller_,
        Erc20Interface underlying_,
        Erc20Interface collateral_,
        address guarantorPool_,
        RedemptionPoolInterface redemptionPool_,
        uint256 expirationTime_
    ) public Erc20(name_, symbol_, decimals_) Admin() {
        fintroller = fintroller_;

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

        /* Set the expiration time. */
        expirationTime = expirationTime_;
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

    /**
     * @notice Returns the vault data.
     */
    function getVault(address user)
        external
        override
        view
        returns (
            uint256 debt,
            uint256 freeCollateral,
            uint256 lockedCollateral,
            bool isOpen
        )
    {
        debt = vaults[user].debt;
        freeCollateral = vaults[user].freeCollateral;
        lockedCollateral = vaults[user].lockedCollateral;
        isOpen = vaults[user].isOpen;
    }

    /*** Non-Constant Functions ***/

    struct BorrowLocalVars {
        MathError mathErr;
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
     * - Must be called post maturation.
     * - The amount to borrow cannot be zero.
     * - The Fintroller must allow borrows.
     * - The caller must not fall below the threshold collateralization ratio.
     *
     * @param borrowAmount The amount of yTokens to print into existence.
     * @return bool true=success, otherwise it reverts.
     */
    function borrow(uint256 borrowAmount) public override isVaultOpen isNotMatured nonReentrant returns (bool) {
        BorrowLocalVars memory vars;

        /* Checks: the zero edge case. */
        require(borrowAmount > 0, "ERR_BORROW_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.borrowAllowed(this), "ERR_BORROW_NOT_ALLOWED");

        /* TODO: check liquidity in the Guarantor Pool and Redemption Pool. */

        /* Checks: the contingent collateralization ratio is higher or equal to the threshold. */
        Vault memory vault = vaults[msg.sender];
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BORROW_MATH_ERROR");

        SimpleOracleInterface oracle = fintroller.oracle();
        (vars.mathErr, vars.lockedCollateralValueInUsd) = oracle.multiplyCollateralAmountByItsPriceInUsd(
            vault.lockedCollateral
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BORROW_MATH_ERROR");

        (vars.mathErr, vars.borrowValueInUsd) = oracle.multiplyUnderlyingAmountByItsPriceInUsd(borrowAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BORROW_MATH_ERROR");

        (vars.mathErr, vars.newDebt) = addUInt(vault.debt, vars.borrowValueInUsd);
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

        /* Effects: increase the debt of the user. */
        vaults[msg.sender].debt = vars.newDebt;

        mintInternal(msg.sender, borrowAmount);

        /* We emit both a Borrow and a Transfer event. */
        emit Borrow(msg.sender, borrowAmount);
        emit Transfer(address(this), msg.sender, borrowAmount);

        return NO_ERROR;
    }

    struct DepositLocalVars {
        MathError mathErr;
        uint256 newFreeCollateral;
    }

    /**
     * @notice Deposits collateral into the user's vault.
     *
     * @dev Emits a {DepositCollateral} event.
     *
     * Requirements:
     * - The vault must be open.
     * - The amount to deposit cannot be zero.
     * - The Fintroller must allow new deposits.
     * - The caller must have allowed this contract to spend `collateralAmount` tokens.
     *
     * @param collateralAmount The amount of collateral to withdraw.
     * @return bool=success, otherwise it reverts.
     */
    function depositCollateral(uint256 collateralAmount) external override isVaultOpen nonReentrant returns (bool) {
        DepositLocalVars memory vars;

        /* Checks: the zero edge case. */
        require(collateralAmount > 0, "ERR_DEPOSIT_COLLATERAL_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.depositCollateralAllowed(this), "ERR_DEPOSIT_COLLATERAL_NOT_ALLOWED");

        /* Effects: update the storage properties. */
        (vars.mathErr, vars.newFreeCollateral) = addUInt(vaults[msg.sender].freeCollateral, collateralAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_DEPOSIT_COLLATERAL_MATH_ERROR");
        vaults[msg.sender].freeCollateral = vars.newFreeCollateral;

        /* Interactions */
        require(
            Erc20Interface(collateral).transferFrom(msg.sender, address(this), collateralAmount),
            "ERR_DEPOSIT_COLLATERAL_ERC20_TRANSFER"
        );

        emit DepositCollateral(msg.sender, collateralAmount);

        return NO_ERROR;
    }

    struct FreeCollateralLocalVars {
        MathError mathErr;
        uint256 collateralPriceInUsd;
        uint256 collateralizationRatioMantissa;
        uint256 debtValueInUsd;
        Exp newCollateralizationRatio;
        uint256 newFreeCollateral;
        uint256 newLockedCollateral;
        uint256 newLockedCollateralValueInUsd;
    }

    /**
     * @notice Frees a portion or all of the locked collateral.
     * @dev Emits a {FreeCollateral} event.
     *
     * Requirements:
     * - The vault must be open.
     * - The amount to free cannot be zero.
     * - There must be enough locked collateral.
     * - The user cannot fall below the collateralization ratio.
     *
     * @param collateralAmount The amount of free collateral to lock.
     * @return bool true=success, otherwise it reverts.
     */
    function freeCollateral(uint256 collateralAmount) external override isVaultOpen returns (bool) {
        FreeCollateralLocalVars memory vars;

        /* Avoid the zero edge case. */
        require(collateralAmount > 0, "ERR_FREE_COLLATERAL_ZERO");

        Vault memory vault = vaults[msg.sender];
        require(vault.lockedCollateral >= collateralAmount, "ERR_FREE_COLLATERAL_INSUFFICIENT_LOCKED_COLLATERAL");

        /* This operation can't fail because of the first `require` in this function. */
        (vars.mathErr, vars.newLockedCollateral) = subUInt(vault.lockedCollateral, collateralAmount);
        assert(vars.mathErr == MathError.NO_ERROR);
        vaults[msg.sender].lockedCollateral = vars.newLockedCollateral;

        if (vault.debt > 0) {
            SimpleOracleInterface oracle = fintroller.oracle();
            (vars.mathErr, vars.newLockedCollateralValueInUsd) = oracle.multiplyCollateralAmountByItsPriceInUsd(
                vars.newLockedCollateral
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

            (vars.mathErr, vars.debtValueInUsd) = oracle.multiplyUnderlyingAmountByItsPriceInUsd(vault.debt);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

            /* This operation can't fail because both operands are non-zero. */
            (vars.mathErr, vars.newCollateralizationRatio) = divExp(
                Exp({ mantissa: vars.newLockedCollateralValueInUsd }),
                Exp({ mantissa: vars.debtValueInUsd })
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

            /* Uncomment this for the "out of gas" error to come back */
            (vars.collateralizationRatioMantissa) = fintroller.getBond(address(this));
            require(
                vars.newCollateralizationRatio.mantissa >= vars.collateralizationRatioMantissa,
                "ERR_BELOW_THRESHOLD_COLLATERALIZATION_RATIO"
            );
        }

        (vars.mathErr, vars.newFreeCollateral) = addUInt(vault.freeCollateral, collateralAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");
        vaults[msg.sender].freeCollateral = vars.newFreeCollateral;

        emit FreeCollateral(msg.sender, collateralAmount);
        return NO_ERROR;
    }

    function liquidateBorrow(address borrower, uint256 repayUnderlyingAmount) external override returns (bool) {
        borrower;
        repayUnderlyingAmount;
        return NO_ERROR;
    }

    struct LockCollateralLocalVars {
        MathError mathErr;
        uint256 newFreeCollateral;
        uint256 newLockedCollateral;
    }

    /**
     * @notice Locks a portion or all of the free collateral to make it eligible for borrowing.
     * @dev Emits a {LockCollateral} event.
     *
     * Requirements:
     * - The vault must be open.
     * - The amount to lock cannot be zero.
     * - There must be enough free collateral.
     *
     * @param collateralAmount The amount of free collateral to lock.
     * @return bool true=success, otherwise it reverts.
     */
    function lockCollateral(uint256 collateralAmount) external override isVaultOpen returns (bool) {
        LockCollateralLocalVars memory vars;

        /* Avoid the zero edge case. */
        require(collateralAmount > 0, "ERR_LOCK_COLLATERAL_ZERO");

        Vault memory vault = vaults[msg.sender];
        require(vault.freeCollateral >= collateralAmount, "ERR_LOCK_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL");

        (vars.mathErr, vars.newLockedCollateral) = addUInt(vault.lockedCollateral, collateralAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_LOCK_COLLATERAL_MATH_ERROR");
        vaults[msg.sender].lockedCollateral = vars.newLockedCollateral;

        /* This operation can't fail because of the first `require` in this function. */
        (vars.mathErr, vars.newFreeCollateral) = subUInt(vault.freeCollateral, collateralAmount);
        assert(vars.mathErr == MathError.NO_ERROR);
        vaults[msg.sender].freeCollateral = vars.newFreeCollateral;

        emit LockCollateral(msg.sender, collateralAmount);
        return NO_ERROR;
    }

    /**
     * @notice Opens a Vault for the caller.
     * @dev Reverts if the caller has previously opened a vault.
     * @return bool=success, otherwise it reverts.
     */
    function openVault() public returns (bool) {
        require(vaults[msg.sender].isOpen == false, "ERR_VAULT_OPEN");
        vaults[msg.sender].isOpen = true;
        return NO_ERROR;
    }

    struct RedeemLocalVars {
        MathError mathErr;
        uint256 newRedeemableUnderlying;
        uint256 newTotalSupply;
        uint256 newUserBalance;
    }

    /**
     * @notice Pays the token holder the face value at maturation time. Recall that yTokens resemble zero-coupon bonds.
     *
     * @dev Emits a {Redeem} event.
     *
     * Requirements:
     * - Must be called post maturation.
     * - The amount to redeem cannot be zero.
     * - There must be enough liquidity in the Redemption Pool.
     *
     * @param redeemAmount The amount of yTokens to redeem for the underlying asset.
     * @return bool=success, otherwise it reverts.
     */
    // function redeem(uint256 redeemAmount) external override isMatured returns (bool) {
    //     RedeemLocalVars memory vars;

    //     /* Checks: the zero edge case. */
    //     require(redeemAmount > 0, "ERR_REDEEM_ZERO");

    //     /* Checks: the Fintroller allows this action to be performed. */
    //     require(fintroller.redeemAllowed(this), "ERR_REDEEM_NOT_ALLOWED");

    //     /* Checks: there is sufficient liquidity. */
    //     require(redeemAmount <= redeemableUnderlyingTotalSupply, "ERR_REDEEM_INSUFFICIENT_REDEEMABLE_UNDERLYING");

    //     /* Effects: decrease the remaining supply of redeemable underlying. */
    //     (vars.mathErr, vars.newRedeemableUnderlying) = subUInt(redeemableUnderlyingTotalSupply, redeemAmount);
    //     assert(vars.mathErr == MathError.NO_ERROR);
    //     redeemableUnderlyingTotalSupply = vars.newRedeemableUnderlying;

    //     /* Effects: decrease the total supply. */
    //     (vars.mathErr, vars.newTotalSupply) = subUInt(totalSupply, redeemAmount);
    //     require(vars.mathErr == MathError.NO_ERROR, "ERR_REDEEM_MATH_ERROR");
    //     totalSupply = vars.newTotalSupply;

    //     /* Effects: decrease the user's balance. */
    //     (vars.mathErr, vars.newUserBalance) = subUInt(balances[msg.sender], redeemAmount);
    //     require(vars.mathErr == MathError.NO_ERROR, "ERR_REDEEM_MATH_ERROR");
    //     balances[msg.sender] = vars.newUserBalance;

    //     /* Interactions */
    //     require(underlying.transfer(msg.sender, redeemAmount), "ERR_REDEEM_ERC20_TRANSFER");

    //     emit Redeem(msg.sender, redeemAmount);

    //     return NO_ERROR;
    // }

    /**
     * @notice Deletes the user's debt from the registry and takes the yTokens out of circulation.
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
    function repayBorrow(uint256 repayAmount) external override isVaultOpen nonReentrant returns (bool) {
        repayBorrowInternal(msg.sender, msg.sender, repayAmount);

        /* We emit both a RepayBorrow and a Transfer event. */
        emit RepayBorrow(msg.sender, repayAmount);
        emit Transfer(msg.sender, address(this), repayAmount);

        return NO_ERROR;
    }

    /**
     * @notice Deletes the user's debt from the registry and takes the yTokens out of circulation.
     * @dev Emits a {RepayBorrow}, {RepayBorrowBehalf} and a {Transfer} event.
     *
     * Requirements: same as the `repayBorrow` function, but here `borrower` is the user who must have
     * at least `repayAmount` yTokens to repay the borrow.
     *
     * @param borrower The address of the user for whom to repay the borrow.
     * @param repayAmount The amount of yTokens to repay.
     * @return bool=success, otherwise it reverts.
     */
    function repayBorrowBehalf(address borrower, uint256 repayAmount) external override nonReentrant returns (bool) {
        require(vaults[borrower].isOpen, "ERR_VAULT_NOT_OPEN");

        repayBorrowInternal(msg.sender, borrower, repayAmount);

        /* We emit a RepayBorrow, RepayBorrowBehalf and a Transfer event. */
        emit RepayBorrow(borrower, repayAmount);
        emit RepayBorrowBehalf(msg.sender, borrower, repayAmount);
        emit Transfer(msg.sender, address(this), repayAmount);

        return NO_ERROR;
    }

    struct WithdrawCollateralLocalVars {
        MathError mathErr;
        uint256 newFreeCollateral;
    }

    /**
     * @notice Withdraws a portion or all of the free collateral.
     *
     * @dev Emits a {WithdrawCollateral} event.
     *
     * Requirements:
     * - The vault must be open.
     * - The amount to withdraw cannot be zero.
     * - There must be sufficient free collateral in the vault.
     *
     * @param collateralAmount The amount of collateral to withdraw.
     * @return bool=success, otherwise it reverts.
     */
    function withdrawCollateral(uint256 collateralAmount) external override isVaultOpen nonReentrant returns (bool) {
        WithdrawCollateralLocalVars memory vars;

        /* Checks: the zero edge case. */
        require(collateralAmount > 0, "ERR_WITHDRAW_COLLATERAL_ZERO");

        /* Checks: there is enough free collateral. */
        require(
            vaults[msg.sender].freeCollateral >= collateralAmount,
            "ERR_WITHDRAW_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL"
        );

        /* Effects: update the storage properties. */
        (vars.mathErr, vars.newFreeCollateral) = subUInt(vaults[msg.sender].freeCollateral, collateralAmount);
        /* This operation can't fail because of the first `require` in this function. */
        assert(vars.mathErr == MathError.NO_ERROR);
        vaults[msg.sender].freeCollateral = vars.newFreeCollateral;

        /* Interactions */
        require(
            Erc20Interface(collateral).transfer(msg.sender, collateralAmount),
            "ERR_WITHDRAW_COLLATERAL_ERC20_TRANSFER"
        );

        emit WithdrawCollateral(msg.sender, collateralAmount);

        return NO_ERROR;
    }

    /*** Internal Functions ***/
    struct RepayBorrowLocalVars {
        MathError mathErr;
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
        RepayBorrowLocalVars memory vars;

        /* Checks: the zero edge case. */
        require(repayAmount > 0, "ERR_REPAY_BORROW_ZERO");

        /* Checks: verify that the Fintroller allows this action to be performed. */
        require(fintroller.repayBorrowAllowed(this), "ERR_REPAY_BORROW_NOT_ALLOWED");

        /* Checks: the payer has enough yTokens. */
        require(balanceOf(payer) >= repayAmount, "ERR_REPAY_BORROW_INSUFFICIENT_BALANCE");

        /* Checks: user has a debt to pay. */
        require(vaults[borrower].debt >= repayAmount, "ERR_REPAY_BORROW_INSUFFICIENT_DEBT");

        /* Effects: reduce the debt of the user. */
        (vars.mathErr, vars.newDebt) = subUInt(vaults[borrower].debt, repayAmount);
        /* This operation can't fail because of the previous `require`. */
        assert(vars.mathErr == MathError.NO_ERROR);
        vaults[borrower].debt = vars.newDebt;

        /* Effects: reduce the yToken supply. */
        (vars.mathErr, vars.newTotalSupply) = subUInt(totalSupply, repayAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_REPAY_BORROW_MATH_ERROR");
        totalSupply = vars.newTotalSupply;

        /* Effects: burn the yTokens. */
        (vars.mathErr, vars.newPayerBalance) = subUInt(balances[payer], repayAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_REPAY_BORROW_MATH_ERROR");
        balances[payer] = vars.newPayerBalance;
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
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_INTERNAL_MATH_ERROR");
        totalSupply = vars.newTotalSupply;

        /* Mint the yTokens. */
        (vars.mathErr, vars.newBeneficiaryBalance) = addUInt(balances[beneficiary], mintAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_INTERNAL_MATH_ERROR");
        balances[beneficiary] = vars.newBeneficiaryBalance;
    }
}
