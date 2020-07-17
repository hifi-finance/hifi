/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./DumbOracle.sol";
import "./yTokenInterface.sol";
import "./erc20/Erc20.sol";
import "./erc20/Erc20Interface.sol";
import "./math/Exponential.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title yToken
 * @author Mainframe
 */
abstract contract yToken is yTokenInterface, Erc20, Exponential, ReentrancyGuard {
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
     * @param underlying_ The address of the underlying asset
     * @param collateral_ The address of the collateral asset
     * @param guarantorPool_ The pool into which Guarantors of this yToken deposit their capital
     * @param expirationTime_ Unix timestamp in seconds for when this token expires
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address underlying_,
        address collateral_,
        address guarantorPool_,
        uint256 expirationTime_
    ) public Erc20(name_, symbol_, decimals_) {
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

    struct MintLocalVars {
        MathError mathErr;
        uint256 ethPriceInDai;
        uint256 ratio;
    }

    function mint(uint256 yTokenAmount) public override isVaultOpenForCaller nonReentrant returns (bool) {

        /* Checks: verify collateralization profile. */
        MintLocalVars memory vars;
        vars.ethPriceInDai = DumbOracle(oracle).getEthPriceInDai();
        vars.ratio = collateralAmount / vars.ethPriceInDai;
        require(vars.ratio >= collateralizationRatio.mantissa, "ERR_COLLATERALIZATION_INSUFFICIENT");

        /* Interactions: attempt to perform the ERC20 transfer. */
        // require(
        //     Erc20Interface(collateral).transferFrom(msg.sender, address(this), endowment),
        //     "ERR_MINT_ERC20_TRANSFER"
        // );

        return true;
    }

    function openVault() public returns (bool) {
        require(vaults[msg.sender].isOpen == false, "ERR_VAULT_OPEN");
        vaults[msg.sender].isOpen = true;
        return true;
    }

    function setCollateralizationRatio(uint256 collateralizationRatio_) external returns (bool) {
        collateralizationRatio = collateralizationRatio_;
        return true;
    }

    function setOracle(address oracle_) external returns (bool) {
        oracle = oracle_;
        return true;
    }

    function supply(uint256 collateralAmount) public isVaultOpenForCaller nonReentrant returns (bool) {
        /* Effects: update the storage properties. */
        vaults[msg.sender].freeCollateral += collateralAmount;

        /* Interactions */
        require(
            Erc20Interface(collateral).transferFrom(msg.sender, address(this), collateralAmount),
            "ERR_SUPPLY_ERC20_TRANSFER"
        );

        return true;
    }

    /**
     * @notice yTokens resemble zero-coupong bonds, so this function pays the
     * token holder the face value at maturation time.
     */
    function settle() external override isMatured returns (bool) {
        return true;
    }
}
