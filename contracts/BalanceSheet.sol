/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/math/PRBMathUD60x18.sol";
import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@paulrberg/contracts/utils/ReentrancyGuard.sol";

import "./IBalanceSheet.sol";
import "./IFintroller.sol";
import "./IFyToken.sol";
import "./oracles/IChainlinkOperator.sol";

/// @title BalanceSheet
/// @author Hifi
/// @notice Manages the debt vault for all fyTokens.
contract BalanceSheet is
    ReentrancyGuard, /// no depedency
    Admin, /// one dependency
    IBalanceSheet /// one dependency
{
    using PRBMathUD60x18 for uint256;
    using SafeErc20 for IErc20;

    /// STORAGE PROPERTIES ///

    /// @inheritdoc IBalanceSheet
    IFintroller public override fintroller;

    /// @inheritdoc IBalanceSheet
    bool public constant override isBalanceSheet = true;

    /// @dev One vault for each fyToken for each account.
    mapping(IFyToken => mapping(address => Vault)) internal vaults;

    /// MODIFIERS ///

    modifier isVaultOpenForMsgSender(IFyToken fyToken) {
        require(vaults[fyToken][msg.sender].isOpen, "VAULT_NOT_OPEN");
        _;
    }

    /// @param fintroller_ The address of the Fintroller contract.
    constructor(IFintroller fintroller_) Admin() {
        // Set the fyToken contract and sanity check it.
        fintroller = fintroller_;
        fintroller.isFintroller();
    }

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IBalanceSheet
    function clutchCollateral(
        IFyToken fyToken,
        address liquidator,
        address borrower,
        uint256 collateralAmount
    ) external override nonReentrant {
        // Checks: the caller is the fyToken.
        require(msg.sender == address(fyToken), "CLUTCH_COLLATERAL_NOT_AUTHORIZED");

        // Checks: there is enough clutchable collateral in the vault.
        uint256 lockedCollateral = vaults[fyToken][borrower].lockedCollateral;
        require(lockedCollateral >= collateralAmount, "INSUFFICIENT_LOCKED_COLLATERAL");

        // Calculate the new locked collateral amount.
        uint256 newLockedCollateral = lockedCollateral - collateralAmount;

        // Effects: update the vault.
        vaults[fyToken][borrower].lockedCollateral = newLockedCollateral;

        // Interactions: transfer the collateral.
        fyToken.collateral().safeTransfer(liquidator, collateralAmount);

        emit ClutchCollateral(fyToken, liquidator, borrower, collateralAmount);
    }

    /// @inheritdoc IBalanceSheet
    function decreaseVaultDebt(
        IFyToken fyToken,
        address borrower,
        uint256 subtractedDebt
    ) external override {
        // Checks: the caller is the fyToken.
        require(msg.sender == address(fyToken), "DECREASE_VAULT_DEBT_NOT_AUTHORIZED");

        // Effects: update storage.
        uint256 oldVaultDebt = vaults[fyToken][borrower].debt;
        vaults[fyToken][borrower].debt -= subtractedDebt;

        emit DecreaseVaultDebt(fyToken, borrower, oldVaultDebt, vaults[fyToken][borrower].debt);
    }

    /// @inheritdoc IBalanceSheet
    function depositCollateral(IFyToken fyToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(fyToken)
        nonReentrant
    {
        // Checks: the zero edge case.
        require(collateralAmount > 0, "DEPOSIT_COLLATERAL_ZERO");

        // Checks: the Fintroller allows this action to be performed.
        require(fintroller.getDepositCollateralAllowed(fyToken), "DEPOSIT_COLLATERAL_NOT_ALLOWED");

        // Effects: update storage.
        uint256 hypotheticalFreeCollateral = vaults[fyToken][msg.sender].freeCollateral + collateralAmount;
        vaults[fyToken][msg.sender].freeCollateral = hypotheticalFreeCollateral;

        // Interactions: perform the Erc20 transfer.
        fyToken.collateral().safeTransferFrom(msg.sender, address(this), collateralAmount);

        emit DepositCollateral(fyToken, msg.sender, collateralAmount);
    }

    /// @inheritdoc IBalanceSheet
    function freeCollateral(IFyToken fyToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(fyToken)
    {
        // Checks: the zero edge case.
        require(collateralAmount > 0, "FREE_COLLATERAL_ZERO");

        // Checks: enough locked collateral.
        Vault memory vault = vaults[fyToken][msg.sender];
        require(vault.lockedCollateral >= collateralAmount, "INSUFFICIENT_LOCKED_COLLATERAL");
        uint256 newLockedCollateral = vault.lockedCollateral - collateralAmount;

        // Checks: the hypothetical collateralization ratio is above the threshold.
        if (vault.debt > 0) {
            uint256 hypotheticalCollateralizationRatio =
                getHypotheticalCollateralizationRatio(fyToken, msg.sender, newLockedCollateral, vault.debt);
            uint256 bondCollateralizationRatio = fintroller.getBondCollateralizationRatio(fyToken);
            require(hypotheticalCollateralizationRatio >= bondCollateralizationRatio, "BELOW_COLLATERALIZATION_RATIO");
        }

        // Effects: update storage.
        vaults[fyToken][msg.sender].lockedCollateral = newLockedCollateral;
        uint256 newFreeCollateral = vault.freeCollateral + collateralAmount;
        vaults[fyToken][msg.sender].freeCollateral = newFreeCollateral;

        emit FreeCollateral(fyToken, msg.sender, collateralAmount);
    }

    /// @inheritdoc IBalanceSheet
    function increaseVaultDebt(
        IFyToken fyToken,
        address borrower,
        uint256 addedDebt
    ) external override {
        // Checks: the caller is the fyToken.
        require(msg.sender == address(fyToken), "INCREASE_VAULT_DEBT_NOT_AUTHORIZED");

        // Effects: update storage.
        uint256 oldVaultDebt = vaults[fyToken][borrower].debt;
        vaults[fyToken][borrower].debt += addedDebt;

        emit IncreaseVaultDebt(fyToken, borrower, oldVaultDebt, vaults[fyToken][borrower].debt);
    }

    /// @inheritdoc IBalanceSheet
    function lockCollateral(IFyToken fyToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(fyToken)
    {
        // Avoid the zero edge case.
        require(collateralAmount > 0, "LOCK_COLLATERAL_ZERO");

        Vault memory vault = vaults[fyToken][msg.sender];
        require(vault.freeCollateral >= collateralAmount, "INSUFFICIENT_FREE_COLLATERAL");

        uint256 newLockedCollateral = vault.lockedCollateral + collateralAmount;
        vaults[fyToken][msg.sender].lockedCollateral = newLockedCollateral;

        uint256 hypotheticalFreeCollateral = vault.freeCollateral - collateralAmount;
        vaults[fyToken][msg.sender].freeCollateral = hypotheticalFreeCollateral;

        emit LockCollateral(fyToken, msg.sender, collateralAmount);
    }

    /// @inheritdoc IBalanceSheet
    function openVault(IFyToken fyToken) external override {
        require(fintroller.isBondListed(fyToken), "BOND_NOT_LISTED");
        require(fyToken.isFyToken(), "OPEN_VAULT_FYTOKEN_INSPECTION");
        require(vaults[fyToken][msg.sender].isOpen == false, "VAULT_OPEN");
        vaults[fyToken][msg.sender].isOpen = true;
        emit OpenVault(fyToken, msg.sender);
    }

    /// @inheritdoc IBalanceSheet
    function withdrawCollateral(IFyToken fyToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(fyToken)
        nonReentrant
    {
        // Checks: the zero edge case.
        require(collateralAmount > 0, "WITHDRAW_COLLATERAL_ZERO");

        // Checks: there is enough free collateral.
        require(vaults[fyToken][msg.sender].freeCollateral >= collateralAmount, "INSUFFICIENT_FREE_COLLATERAL");

        // Effects: update storage.
        uint256 newFreeCollateral = vaults[fyToken][msg.sender].freeCollateral - collateralAmount;
        vaults[fyToken][msg.sender].freeCollateral = newFreeCollateral;

        // Interactions: perform the Erc20 transfer.
        fyToken.collateral().safeTransfer(msg.sender, collateralAmount);

        emit WithdrawCollateral(fyToken, msg.sender, collateralAmount);
    }

    /// CONSTANT FUNCTIONS ///

    struct GetClutchableCollateralLocalVars {
        uint256 clutchableCollateralAmountUpscaled;
        uint256 clutchableCollateralAmount;
        uint256 collateralPrecisionScalar;
        uint256 collateralPriceUpscaled;
        uint256 liquidationIncentive;
        uint256 numerator;
        uint256 oraclePricePrecisionScalar;
        uint256 underlyingPriceUpscaled;
    }

    /// @inheritdoc IBalanceSheet
    function getClutchableCollateral(IFyToken fyToken, uint256 repayAmount) external view override returns (uint256) {
        GetClutchableCollateralLocalVars memory vars;

        // Avoid the zero edge cases.
        require(repayAmount > 0, "GET_CLUTCHABLE_COLLATERAL_ZERO");

        // When the liquidation incentive is zero, the end result would be zero anyways.
        vars.liquidationIncentive = fintroller.getBondLiquidationIncentive(fyToken);
        if (vars.liquidationIncentive == 0) {
            return 0;
        }

        // Grab the upscaled USD price of the underlying.
        IChainlinkOperator oracle = fintroller.oracle();
        vars.underlyingPriceUpscaled = oracle.getAdjustedPrice(fyToken.underlying().symbol());

        // Grab the upscaled USD price of the collateral.
        vars.collateralPriceUpscaled = oracle.getAdjustedPrice(fyToken.collateral().symbol());

        // Calculate the top part of the equation.
        vars.numerator = repayAmount.mul(vars.liquidationIncentive.mul(vars.underlyingPriceUpscaled));

        // Calculate the mantissa form of the clutched collateral amount.
        vars.clutchableCollateralAmountUpscaled = vars.numerator.div(vars.collateralPriceUpscaled);

        // If the precision scalar is not 1, calculate the final form of the clutched collateral amount.
        vars.collateralPrecisionScalar = fyToken.collateralPrecisionScalar();
        if (vars.collateralPrecisionScalar != 1) {
            vars.clutchableCollateralAmount = vars.clutchableCollateralAmountUpscaled / vars.collateralPrecisionScalar;
        } else {
            vars.clutchableCollateralAmount = vars.clutchableCollateralAmountUpscaled;
        }

        return vars.clutchableCollateralAmount;
    }

    /// @inheritdoc IBalanceSheet
    function getCurrentCollateralizationRatio(IFyToken fyToken, address borrower)
        public
        view
        override
        returns (uint256)
    {
        Vault memory vault = vaults[fyToken][borrower];
        return getHypotheticalCollateralizationRatio(fyToken, borrower, vault.lockedCollateral, vault.debt);
    }

    struct GetHypotheticalAccountLiquidityLocalVars {
        uint256 collateralPriceUpscaled;
        uint256 collateralPrecisionScalar;
        uint256 collateralizationRatioMantissa;
        uint256 debtValueUsd;
        uint256 hypotheticalCollateralizationRatio;
        uint256 lockedCollateralValueUsd;
        uint256 lockedCollateralUpscaled;
        uint256 oraclePricePrecisionScalar;
        uint256 underlyingPriceUpscaled;
        uint256 underlyingPrecisionScalar;
    }

    /// @inheritdoc IBalanceSheet
    function getHypotheticalCollateralizationRatio(
        IFyToken fyToken,
        address borrower,
        uint256 lockedCollateral,
        uint256 debt
    ) public view override returns (uint256) {
        GetHypotheticalAccountLiquidityLocalVars memory vars;

        // If the vault is not open, a hypothetical collateralization ratio cannot be calculated.
        require(vaults[fyToken][borrower].isOpen, "VAULT_NOT_OPEN");

        // Avoid the zero edge cases.
        if (lockedCollateral == 0) {
            return 0;
        }
        require(debt > 0, "GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_DEBT_ZERO");

        // Grab the upscaled USD price of the collateral.
        IChainlinkOperator oracle = fintroller.oracle();
        vars.collateralPriceUpscaled = oracle.getAdjustedPrice(fyToken.collateral().symbol());

        // Grab the upscaled USD price of the underlying.
        vars.underlyingPriceUpscaled = oracle.getAdjustedPrice(fyToken.underlying().symbol());

        // Upscale the collateral, which can have any precision, to mantissa precision.
        vars.collateralPrecisionScalar = fyToken.collateralPrecisionScalar();
        if (vars.collateralPrecisionScalar != 1) {
            vars.lockedCollateralUpscaled = lockedCollateral * vars.collateralPrecisionScalar;
        } else {
            vars.lockedCollateralUpscaled = lockedCollateral;
        }

        // Calculate the USD value of the collateral.
        vars.lockedCollateralValueUsd = vars.lockedCollateralUpscaled.mul(vars.collateralPriceUpscaled);

        // Calculate the USD value of the debt.
        vars.debtValueUsd = debt.mul(vars.underlyingPriceUpscaled);

        // Calculate the collateralization ratio by dividing the USD value of the hypothetical locked collateral by
        // the USD value of the debt.
        vars.hypotheticalCollateralizationRatio = vars.lockedCollateralValueUsd.div(vars.debtValueUsd);

        return vars.hypotheticalCollateralizationRatio;
    }

    /// @inheritdoc IBalanceSheet
    function getVault(IFyToken fyToken, address borrower) external view override returns (Vault memory) {
        return vaults[fyToken][borrower];
    }

    /// @inheritdoc IBalanceSheet
    function getVaultDebt(IFyToken fyToken, address borrower) external view override returns (uint256) {
        return vaults[fyToken][borrower].debt;
    }

    /// @inheritdoc IBalanceSheet
    function getVaultLockedCollateral(IFyToken fyToken, address borrower) external view override returns (uint256) {
        return vaults[fyToken][borrower].lockedCollateral;
    }

    /// @inheritdoc IBalanceSheet
    function isAccountUnderwater(IFyToken fyToken, address borrower) external view override returns (bool) {
        Vault memory vault = vaults[fyToken][borrower];
        if (!vault.isOpen || vault.debt == 0) {
            return false;
        }
        uint256 currentCollateralizationRatioMantissa = getCurrentCollateralizationRatio(fyToken, borrower);
        uint256 thresholdCollateralizationRatioMantissa = fintroller.getBondCollateralizationRatio(fyToken);
        return currentCollateralizationRatioMantissa < thresholdCollateralizationRatioMantissa;
    }

    /// @inheritdoc IBalanceSheet
    function isVaultOpen(IFyToken fyToken, address borrower) external view override returns (bool) {
        return vaults[fyToken][borrower].isOpen;
    }
}
