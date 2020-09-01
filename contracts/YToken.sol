/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";
import "./erc20/Erc20.sol";
import "./erc20/Erc20Interface.sol";
import "./math/Exponential.sol";
import "./pricing/DumbOracleInterface.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title YToken
 * @author Mainframe
 */
contract YToken is YTokenInterface, Erc20, Admin, ErrorReporter, ReentrancyGuard {
    modifier isMatured() {
        require(getBlockTimestamp() >= expirationTime, "ERR_BOND_NOT_MATURED");
        _;
    }

    modifier isNotMatured() {
        require(getBlockTimestamp() < expirationTime, "ERR_BOND_MATURED");
        _;
    }

    modifier isVaultOpen() {
        require(vaults[msg.sender].isOpen, "ERR_VAULT_NOT_OPEN");
        _;
    }

    /**
     * @dev This implementation assumes that the yToken has the same number of decimals as the underlying.
     * @param name_ ERC-20 name of this token
     * @param symbol_ ERC-20 symbol of this token
     * @param decimals_ ERC-20 decimal precision of this token
     * @param fintroller_ The address of the fintroller contract
     * @param underlying_ The contract address of the underlying asset
     * @param collateral_ The contract address of the totalCollateral asset
     * @param guarantorPool_ The pool into which Guarantors of this YToken deposit their capital
     * @param expirationTime_ Unix timestamp in seconds for when this token expires
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        FintrollerInterface fintroller_,
        Erc20Interface underlying_,
        Erc20Interface collateral_,
        address guarantorPool_,
        uint256 expirationTime_
    ) public Erc20(name_, symbol_, decimals_) Admin() {
        fintroller = fintroller_;

        /* Set underlying and totalCollateral and sanity check them. */
        underlying = underlying_;
        Erc20Interface(underlying_).totalSupply();

        collateral = collateral_;
        Erc20Interface(collateral_).totalSupply();

        /* Set the guarantor pool. */
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
        uint256 blockTimestamp = getBlockTimestamp();
        if (expirationTime > blockTimestamp) {
            return expirationTime - blockTimestamp;
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

    /**
     * @notice Deletes the user's debt from the registry and takes the yTokens out of circulation.
     * @dev Emits a {Burn} and a {Transfer} event.
     *
     * Requirements:
     * - The vault must be open.
     * - The amount to burn cannot be zero.
     * - The caller must have at least `burnAmount` yTokens.
     * - The caller must have at least `burnAmount` as debt yTokens.
     * - The caller cannot fall below the threshold collateralization ratio.
     *
     * @param burnAmount Lorem ipsum.
     * @return bool=success, otherwise it reverts.
     */
    function burn(uint256 burnAmount) external override isVaultOpen nonReentrant returns (bool) {
        burnInternal(msg.sender, msg.sender, burnAmount);

        /* We emit both a Burn and a Transfer event. */
        emit Burn(msg.sender, burnAmount);
        emit Transfer(msg.sender, address(this), burnAmount);

        return NO_ERROR;
    }

    /**
     * @notice Deletes the user's debt from the registry and takes the yTokens out of circulation.
     * @dev Emits a {Burn}, {BurnBehalf} and a {Transfer} event.
     *
     * Requirements: same as the `burn` function, but here `borrower` is the one who must have
     * at least `burnAmount` as debt yTokens.
     *
     * @param burnAmount Lorem ipsum.
     * @param burnAmount Lorem ipsum.
     * @return bool=success, otherwise it reverts.
     */
    function burnBehalf(address borrower, uint256 burnAmount) external override nonReentrant returns (bool) {
        require(vaults[borrower].isOpen, "ERR_VAULT_NOT_OPEN");

        burnInternal(msg.sender, borrower, burnAmount);

        /* We emit a Burn, BurnBehalf and a Transfer event. */
        emit Burn(borrower, burnAmount);
        emit BurnBehalf(msg.sender, borrower, burnAmount);
        emit Transfer(msg.sender, address(this), burnAmount);

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
     * - The fintroller must allow new deposit.
     * - The caller must have allowed this contract to spend `collateralAmount` tokens.
     *
     * @param collateralAmount The amount of collateral to withdraw.
     * @return bool=success, otherwise it reverts.
     */
    function depositCollateral(uint256 collateralAmount) external override isVaultOpen nonReentrant returns (bool) {
        DepositLocalVars memory vars;

        /* Checks: avoid the zero edge case. */
        require(collateralAmount > 0, "ERR_DEPOSIT_COLLATERAL_ZERO");
        /* Checks: verify that the Fintroller allows this action to be performed. */
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

        if (vaults[msg.sender].debt > 0) {
            (vars.mathErr, vars.newLockedCollateralValueInUsd) = getCollateralValueInUsd(vars.newLockedCollateral);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

            (vars.mathErr, vars.debtValueInUsd) = getUnderlyingValueInUsd(vault.debt);
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

    function liquidate(address borrower, uint256 repayUnderlyingAmount) external override returns (bool) {
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
     * @notice Locks a portion or all of the free collateral to make it eligible for minting.
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

    struct MintLocalVars {
        MathError mathErr;
        uint256 lockedCollateralValueInUsd;
        uint256 mintValueInUsd;
        Exp newCollateralizationRatio;
        uint256 newDebt;
        uint256 newMinterBalance;
        uint256 newTotalSupply;
        uint256 thresholdCollateralizationRatioMantissa;
        uint256 timeToLive;
    }

    /**
     * @notice Mints new yTokens and increases the debt of the caller.
     * @dev Emits a {Mint} and a {Transfer} event.
     *
     * Requirements:
     *
     * - The vault must be open.
     * - The amount to mint cannot be zero.
     * - The fintroller must allow new mints.
     * - The yToken must not be matured.
     * - The caller must not fall below the threshold collateralization ratio.
     *
     * @param mintAmount The amount of yTokens to print into existence.
     * @return bool true=success, otherwise it reverts.
     */
    function mint(uint256 mintAmount) public override isVaultOpen isNotMatured nonReentrant returns (bool) {
        MintLocalVars memory vars;

        /* Checks: avoid the zero edge case. */
        require(mintAmount > 0, "ERR_MINT_ZERO");

        /* Checks: verify that the Fintroller allows this action to be performed. */
        require(fintroller.mintAllowed(this), "ERR_MINT_NOT_ALLOWED");

        /* TODO: check liquidity in the guarantor pool. */

        /* Checks: the contingent collateralization ratio is higher or equal to the threshold. */
        Vault memory vault = vaults[msg.sender];
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        (vars.mathErr, vars.lockedCollateralValueInUsd) = getCollateralValueInUsd(vault.lockedCollateral);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        /* TODO: handle the case where the underlying has a different no. of decimals compared to the yToken? */
        (vars.mathErr, vars.mintValueInUsd) = getUnderlyingValueInUsd(mintAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        (vars.mathErr, vars.newDebt) = addUInt(vault.debt, vars.mintValueInUsd);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        (vars.mathErr, vars.newCollateralizationRatio) = divExp(
            Exp({ mantissa: vars.lockedCollateralValueInUsd }),
            Exp({ mantissa: vars.newDebt })
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        (vars.thresholdCollateralizationRatioMantissa) = fintroller.getBond(address(this));
        require(
            vars.newCollateralizationRatio.mantissa >= vars.thresholdCollateralizationRatioMantissa,
            "ERR_BELOW_THRESHOLD_COLLATERALIZATION_RATIO"
        );

        /* Effects: increase the debt of the user. */
        vaults[msg.sender].debt = vars.newDebt;

        /* Effects: increase the yToken supply. */
        (vars.mathErr, vars.newTotalSupply) = addUInt(totalSupply, mintAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");
        totalSupply = vars.newTotalSupply;

        /* Effects: mint the yTokens. */
        (vars.mathErr, vars.newMinterBalance) = addUInt(balances[msg.sender], mintAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");
        balances[msg.sender] = vars.newMinterBalance;

        /* We emit both a Mint and a Transfer event. */
        emit Mint(msg.sender, mintAmount);
        emit Transfer(address(this), msg.sender, mintAmount);

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

    /**
     * @notice YTokens resemble zero-coupon bonds, so this function pays the
     * token holder the face value at maturation time.
     */
    function settle() external override isMatured returns (bool) {
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

        /* Checks: avoid the zero edge case. */
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

    /**
     * @dev Retrieves the block timestamp. This exists mainly for stubbing
     * it when testing.
     */
    function getBlockTimestamp() internal view returns (uint256) {
        return block.timestamp;
    }

    struct GetCollateralValueInUsdLocalVars {
        MathError mathErr;
        uint256 collateralPriceInUsd;
        uint256 collateralValueInUsd;
    }

    /**
     * @dev Used to avoid duplicating the logic.
     */
    function getCollateralValueInUsd(uint256 collateralAmount) internal view returns (MathError, uint256) {
        GetCollateralValueInUsdLocalVars memory vars;
        vars.collateralPriceInUsd = fintroller.oracle().getEthPriceInUsd();
        (vars.mathErr, vars.collateralValueInUsd) = mulUInt(collateralAmount, vars.collateralPriceInUsd);
        return (vars.mathErr, vars.collateralValueInUsd);
    }

    struct GetUnderlyingValueInUsdLocalVars {
        MathError mathErr;
        uint256 underlyingPriceInUsd;
        uint256 underlyingValueInUsd;
    }

    /**
     * @dev Used to avoid duplicating the logic.
     */
    function getUnderlyingValueInUsd(uint256 underlyingAmount) internal view returns (MathError, uint256) {
        GetUnderlyingValueInUsdLocalVars memory vars;
        vars.underlyingPriceInUsd = fintroller.oracle().getDaiPriceInUsd();
        (vars.mathErr, vars.underlyingValueInUsd) = mulUInt(underlyingAmount, vars.underlyingPriceInUsd);
        return (vars.mathErr, vars.underlyingValueInUsd);
    }

    struct BurnLocalVars {
        MathError mathErr;
        uint256 newBurnerBalance;
        uint256 newDebt;
        uint256 newTotalSupply;
    }

    /**
     * @dev See the documentation in the public functions.
     */
    function burnInternal(
        address payer,
        address borrower,
        uint256 burnAmount
    ) internal returns (bool) {
        BurnLocalVars memory vars;

        /* Checks: avoid the zero edge case. */
        require(burnAmount > 0, "ERR_BURN_ZERO");

        /* Checks: verify that the Fintroller allows this action to be performed. */
        require(fintroller.burnAllowed(this), "ERR_BURN_NOT_ALLOWED");

        /* Checks: the payer has enough yTokens. */
        require(balanceOf(payer) >= burnAmount, "ERR_BURN_INSUFFICIENT_BALANCE");

        /* Checks: minter has a debt to pay. */
        require(vaults[borrower].debt >= burnAmount, "ERR_BURN_INSUFFICIENT_DEBT");

        /* Effects: reduce the debt of the user. */
        (vars.mathErr, vars.newDebt) = subUInt(vaults[borrower].debt, burnAmount);
        /* This operation can't fail because of the last `require` from above. */
        assert(vars.mathErr == MathError.NO_ERROR);
        vaults[borrower].debt = vars.newDebt;

        /* Effects: reduce the yToken supply. */
        (vars.mathErr, vars.newTotalSupply) = subUInt(totalSupply, burnAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BURN_MATH_ERROR");
        totalSupply = vars.newTotalSupply;

        /* Effects: burn the yTokens. */
        (vars.mathErr, vars.newBurnerBalance) = subUInt(balances[payer], burnAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_BURN_MATH_ERROR");
        balances[payer] = vars.newBurnerBalance;

        return NO_ERROR;
    }
}
