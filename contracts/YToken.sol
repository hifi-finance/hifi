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
        require(block.timestamp >= expirationTime, "ERR_NOT_MATURED");
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
    function timeToLive() public view returns (uint256) {
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
        returns (uint256 freeCollateral, uint256 lockedCollateral)
    {
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

    function depositCollateral(uint256 collateralAmount) public override isVaultOpen nonReentrant returns (bool) {
        /* Checks: verify that the Fintroller allows this action to be performed. */
        require(fintroller.depositAllowed(this), "ERR_DEPOSIT_NOT_ALLOWED");

        /* Effects: update the storage properties. */
        DepositLocalVars memory vars;
        (vars.mathErr, vars.newFreeCollateral) = addUInt(vaults[msg.sender].freeCollateral, collateralAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_DEPOSIT_MATH_ERROR");
        vaults[msg.sender].freeCollateral = vars.newFreeCollateral;

        /* Interactions */
        require(
            Erc20Interface(collateral).transferFrom(msg.sender, address(this), collateralAmount),
            "ERR_DEPOSIT_ERC20_TRANSFER"
        );

        emit DepositCollateral(msg.sender, collateralAmount);

        return NO_ERROR;
    }

    function freeCollateral(uint256 collateralAmount) external override isVaultOpen returns (bool) {
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
     * @notice Locks some or all of the free collateral in order to be used for minting.
     * @dev Emits a {LockCollateral} event.
     *
     * Requirements:
     * - The vault must be open
     * - There must be enough free collateral
     *
     * @param collateralAmount The amount of free collateral to lock.
     * @return bool true=success, otherwise it reverts.
     */
    function lockCollateral(uint256 collateralAmount) external override isVaultOpen returns (bool) {
        Vault memory vault = vaults[msg.sender];
        require(vault.freeCollateral >= collateralAmount, "ERR_LOCK_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL");

        LockCollateralLocalVars memory vars;

        (vars.mathErr, vars.newLockedCollateral) = addUInt(vault.lockedCollateral, collateralAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_LOCK_COLLATERAL_MATH_ERROR");
        vaults[msg.sender].lockedCollateral = vars.newLockedCollateral;

        (vars.mathErr, vars.newFreeCollateral) = subUInt(vault.freeCollateral, collateralAmount);
        require(vars.mathErr == MathError.NO_ERROR, "newFreeCollateral");
        vaults[msg.sender].freeCollateral = vars.newFreeCollateral;

        emit LockCollateral(msg.sender, collateralAmount);
        return NO_ERROR;
    }

    struct MintLocalVars {
        MathError mathErr;
        uint256 collateralPriceInUsd;
        uint256 collateralizationRatioMantissa;
        uint256 lockedCollateralValue;
        uint256 mintValue;
        Exp newCollateralizationRatio;
        uint256 newDebt;
        uint256 newMinterBalance;
        uint256 newTotalSupply;
        uint256 timeToLive;
        uint256 underlyingPriceInUsd;
        uint256 valueOfCollateralInUsd;
    }

    /**
     * @notice Mints new yTokens and increases the debt of the caller.
     * @dev Requirements:
     *
     * - The vault must be open
     * - The yToken must be listed as a bond in the fintroller registry
     * - The fintroller must allow new mints
     * - The yToken must not be matured
     *
     * @param yTokenAmount The amount of yTokens to print into existence.
     * @return bool true=success, otherwise it reverts.
     */
    function mint(uint256 yTokenAmount) public override isVaultOpen nonReentrant returns (bool) {
        MintLocalVars memory vars;

        /* Checks: verify that the Fintroller allows this action to be performed. */
        require(fintroller.mintAllowed(this), "ERR_MINT_NOT_ALLOWED");

        /* Checks: verify that the yToken did not mature. */
        vars.timeToLive = timeToLive();
        require(vars.timeToLive > 0, "ERR_BOND_MATURED");

        /* TODO: check liquidity in the guarantor pool. */

        Vault memory vault = vaults[msg.sender];
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        vars.collateralPriceInUsd = fintroller.oracle().getEthPriceInUsd();
        (vars.mathErr, vars.lockedCollateralValue) = mulUInt(vault.lockedCollateral, vars.collateralPriceInUsd);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        vars.underlyingPriceInUsd = fintroller.oracle().getDaiPriceInUsd();
        (vars.mathErr, vars.mintValue) = mulUInt(yTokenAmount, vars.underlyingPriceInUsd);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        (vars.mathErr, vars.newDebt) = addUInt(vault.debt, yTokenAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        (vars.mathErr, vars.newCollateralizationRatio) = divExp(
            Exp({ mantissa: vars.lockedCollateralValue }),
            Exp({ mantissa: vars.newDebt })
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_MINT_MATH_ERROR");

        /* Checks: the new collateralization ratio must be be higher or equal to the threshold. */
        (vars.collateralizationRatioMantissa) = fintroller.getBond(address(this));
        require(
            vars.newCollateralizationRatio.mantissa >= vars.collateralizationRatioMantissa,
            "ERR_MINT_INSUFFICIENT_LOCKED_COLLATERAL"
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
     */
    function openVault() public returns (bool) {
        require(vaults[msg.sender].isOpen == false, "ERR_VAULT_OPEN");
        vaults[msg.sender].isOpen = true;
        return true;
    }

    /**
     * @notice YTokens resemble zero-coupon bonds, so this function pays the
     * token holder the face value at maturation time.
     */
    function settle() external override isMatured returns (bool) {
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
     * @dev Simply retrieves the block timestamp. This exists mainly for stubbing
     * it when testing.
     */
    function getBlockTimestamp() internal view returns (uint256) {
        return block.timestamp;
    }
}
