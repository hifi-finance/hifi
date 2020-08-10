/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "@nomiclabs/buidler/console.sol";
import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";
import "./erc20/Erc20.sol";
import "./erc20/Erc20Interface.sol";
import "./math/Exponential.sol";
import "./pricing/DumbOracle.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title YToken
 * @author Mainframe
 */
contract YToken is YTokenInterface, Erc20, Admin, ErrorReporter, ReentrancyGuard {
    modifier isVaultOpenForCaller() {
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
     * @param collateral_ The contract address of the collateral asset
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

        /* Set underlying and collateral and sanity check them. */
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

    function deposit(uint256 collateralAmount) public override isVaultOpenForCaller nonReentrant returns (bool) {
        /* Checks: verify that the Fintroller allows this action to be performed. */
        require(fintroller.depositAllowed(this), "ERR_DEPOSIT_NOT_ALLOWED");

        /* Effects: update the storage properties. */
        vaults[msg.sender].freeCollateral += collateralAmount;

        /* Interactions */
        require(
            Erc20Interface(collateral).transferFrom(msg.sender, address(this), collateralAmount),
            "ERR_DEPOSIT_ERC20_TRANSFER"
        );

        emit DepositCollateral(msg.sender, collateralAmount);

        return NO_ERROR;
    }

    function liquidate(address borrower, uint256 repayUnderlyingAmount) external override returns (bool) {
        return NO_ERROR;
    }

    struct MintLocalVars {
        MathError mathErr;
        uint256 ethPriceInDai;
        uint256 ratio;
    }

    function mint(uint256 yTokenAmount) public override isVaultOpenForCaller nonReentrant returns (bool) {
        /* Checks: verify that the Fintroller allows this action to be performed. */
        require(fintroller.mintAllowed(this), "ERR_MINT_NOT_ALLOWED");

        /* Checks: verify collateralization profile. */
        // MintLocalVars memory vars;
        // vars.ethPriceInDai = DumbOracle(oracle).getEthPriceInDai();
        // vars.ratio = YTokenAmount / vars.ethPriceInDai;
        // console.log("YTokenAmount", YTokenAmount);
        // console.log("vars.ethPriceInDai", vars.ethPriceInDai);
        // console.log("vars.ratio", vars.ratio);
        // require(vars.ratio >= collateralizationRatio.mantissa, "ERR_COLLATERALIZATION_INSUFFICIENT");

        /* Interactions: attempt to perform the ERC20 transfer. */
        // require(
        //     Erc20Interface(collateral).transferFrom(msg.sender, address(this), endowment),
        //     "ERR_MINT_ERC20_TRANSFER"
        // );

        return true;
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
}
