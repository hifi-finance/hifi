/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "@nomiclabs/buidler/console.sol";
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
    modifier isVaultOpen() {
        require(vaults[msg.sender].isOpen, "ERR_VAULT_NOT_OPEN");
        _;
    }

    modifier isMatured() {
        require(block.timestamp >= expirationTime, "ERR_BOND_NOT_MATURED");
        _;
    }

    modifier isNotMatured() {
        require(block.timestamp < expirationTime, "ERR_BOND_MATURED");
        _;
    }

    /**
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
    function getVault(address vaultHolder)
        external
        override
        view
        returns (
            uint256 debt,
            uint256 freeCollateral,
            uint256 lockedCollateral
        )
    {
        debt = vaults[vaultHolder].debt;
        freeCollateral = vaults[vaultHolder].freeCollateral;
        lockedCollateral = vaults[vaultHolder].lockedCollateral;
    }

    /*** Non-Constant Functions ***/

    function burn(uint256 burnAmount) external override returns (bool) {
        return NO_ERROR;
    }

    function burnBehalf(address minter, uint256 burnAmount) external override returns (bool) {
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
        /* Checks: avoid the zero edge case. */
        require(collateralAmount > 0, "ERR_DEPOSIT_COLLATERAL_ZERO");
        /* Checks: verify that the Fintroller allows this action to be performed. */
        require(fintroller.depositAllowed(this), "ERR_DEPOSIT_COLLATERAL_NOT_ALLOWED");

        /* Effects: update the storage properties. */
        DepositLocalVars memory vars;
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
        uint256 newLockedCollateralValue;
        uint256 underlyingPriceInUsd;
    }

    /**
     * @notice Frees a portion or all of the locked collateral.
     * @dev Emits a {FreeCollateral} event.
     *
     * Requirements:
     * - The vault must be open.
     * - The amount to free cannot be zero.
     * - There must be enough locked collateral.
     * - The user must not fall below the collateralization ratio.
     *
     * @param collateralAmount The amount of free collateral to lock.
     * @return bool true=success, otherwise it reverts.
     */
    function freeCollateral(uint256 collateralAmount) external override isVaultOpen returns (bool) {
        /* Avoid the zero edge case. */
        require(collateralAmount > 0, "ERR_FREE_COLLATERAL_ZERO");

        Vault memory vault = vaults[msg.sender];
        require(vault.lockedCollateral >= collateralAmount, "ERR_FREE_COLLATERAL_INSUFFICIENT_LOCKED_COLLATERAL");

        FreeCollateralLocalVars memory vars;

        /* This operation can't fail because of the first `require` in this function. */
        (vars.mathErr, vars.newLockedCollateral) = subUInt(vault.lockedCollateral, collateralAmount);
        assert(vars.mathErr == MathError.NO_ERROR);
        vaults[msg.sender].lockedCollateral = vars.newLockedCollateral;

        if (vaults[msg.sender].debt > 0) {
            vars.collateralPriceInUsd = fintroller.oracle().getEthPriceInUsd();
            (vars.mathErr, vars.newLockedCollateralValue) = mulUInt(
                vars.newLockedCollateral,
                vars.collateralPriceInUsd
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

            vars.underlyingPriceInUsd = fintroller.oracle().getDaiPriceInUsd();
            (vars.mathErr, vars.debtValueInUsd) = mulUInt(vault.debt, vars.underlyingPriceInUsd);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

            /* This operation can't fail because both operands are non-zero. */
            (vars.mathErr, vars.newCollateralizationRatio) = divExp(
                Exp({ mantissa: vars.newLockedCollateralValue }),
                Exp({ mantissa: vars.debtValueInUsd })
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");

            /* Uncomment this for the "out of gas" error to come back */
            (vars.collateralizationRatioMantissa) = fintroller.getBond(address(this));
            require(
                vars.newCollateralizationRatio.mantissa >= vars.collateralizationRatioMantissa,
                "ERR_BELOW_COLLATERALIZATION_RATIO"
            );
        }

        (vars.mathErr, vars.newFreeCollateral) = addUInt(vault.freeCollateral, collateralAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_FREE_COLLATERAL_MATH_ERROR");
        vaults[msg.sender].freeCollateral = vars.newFreeCollateral;

        emit FreeCollateral(msg.sender, collateralAmount);
        return NO_ERROR;
    }

    function liquidate(address borrower, uint256 repayUnderlyingAmount) external override returns (bool) {
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
        /* Avoid the zero edge case. */
        require(collateralAmount > 0, "ERR_LOCK_COLLATERAL_ZERO");

        Vault memory vault = vaults[msg.sender];
        require(vault.freeCollateral >= collateralAmount, "ERR_LOCK_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL");

        LockCollateralLocalVars memory vars;

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
        uint256 collateralPriceInUsd;
        uint256 collateralizationRatioMantissa;
        uint256 lockedCollateralValueInUsd;
        uint256 mintValueInUsd;
        Exp newCollateralizationRatio;
        uint256 newDebt;
        uint256 newMinterBalance;
        uint256 newTotalSupply;
        uint256 timeToLive;
        uint256 underlyingPriceInUsd;
    }

    /**
     * @notice Mints new yTokens and increases the debt of the caller.
     * @dev Requirements:
     *
     * - The vault must be open.
     * - The amount to mint cannot be zero.
     * - The fintroller must allow new mints.
     * - The yToken must not be matured.
     *
     * @param yTokenAmount The amount of yTokens to print into existence.
     * @return bool true=success, otherwise it reverts.
     */
    function mint(uint256 yTokenAmount) public override isVaultOpen isNotMatured nonReentrant returns (bool) {
        MintLocalVars memory vars;

        /* Checks: avoid the zero edge case. */
        require(yTokenAmount > 0, "ERR_MINT_ZERO");

        /* Checks: verify that the Fintroller allows this action to be performed. */
        require(fintroller.mintAllowed(this), "ERR_MINT_NOT_ALLOWED");

        /* TODO: check liquidity in the guarantor pool. */

        Vault memory vault = vaults[msg.sender];
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        vars.collateralPriceInUsd = fintroller.oracle().getEthPriceInUsd();
        (vars.mathErr, vars.lockedCollateralValueInUsd) = mulUInt(vault.lockedCollateral, vars.collateralPriceInUsd);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        vars.underlyingPriceInUsd = fintroller.oracle().getDaiPriceInUsd();
        (vars.mathErr, vars.mintValueInUsd) = mulUInt(yTokenAmount, vars.underlyingPriceInUsd);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        (vars.mathErr, vars.newDebt) = addUInt(vault.debt, yTokenAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        (vars.mathErr, vars.newCollateralizationRatio) = divExp(
            Exp({ mantissa: vars.lockedCollateralValueInUsd }),
            Exp({ mantissa: vars.newDebt })
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        /* Checks: the new collateralization ratio must be be higher or equal to the threshold. */
        (vars.collateralizationRatioMantissa) = fintroller.getBond(address(this));
        require(
            vars.newCollateralizationRatio.mantissa >= vars.collateralizationRatioMantissa,
            "ERR_BELOW_COLLATERALIZATION_RATIO"
        );

        /* Effects: update the new debt. */
        vaults[msg.sender].debt = vars.newDebt;

        /* Effects: increases the yToken supply. */
        (vars.mathErr, vars.newTotalSupply) = addUInt(totalSupply, yTokenAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");
        totalSupply = vars.newTotalSupply;

        /* Effects: mints the yTokens. */
        (vars.mathErr, vars.newMinterBalance) = addUInt(balances[msg.sender], yTokenAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");
        balances[msg.sender] = vars.newMinterBalance;

        /* We emit both a Mint and a Transfer event */
        emit Mint(msg.sender, yTokenAmount);
        emit Transfer(address(this), msg.sender, yTokenAmount);

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
        /* Checks: avoid the zero edge case. */
        require(collateralAmount > 0, "ERR_WITHDRAW_COLLATERAL_ZERO");

        /* Checks: there is enough free collateral. */
        require(
            vaults[msg.sender].freeCollateral >= collateralAmount,
            "ERR_WITHDRAW_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL"
        );

        /* Effects: update the storage properties. */
        WithdrawCollateralLocalVars memory vars;
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

    /*** Admin Functions ***/

    function _reduceReserves(uint256 reduceAmount) external override isAuthorized returns (bool) {
        return NO_ERROR;
    }

    function _setReserveFactor(uint256 newReserveFactorMantissa) external override isAuthorized returns (bool) {
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
}
