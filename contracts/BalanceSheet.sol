/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/math/PRBMathUD60x18.sol";
import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@paulrberg/contracts/utils/ReentrancyGuard.sol";

import "./IBalanceSheet.sol";
import "./IFintroller.sol";
import "./IHToken.sol";
import "./oracles/IChainlinkOperator.sol";

/// @title BalanceSheet
/// @author Hifi
/// @notice Manages the debt vault for all hTokens.
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

    /// @dev One vault for each hToken for each account.
    mapping(IHToken => mapping(address => Vault)) internal vaults;

    /// MODIFIERS ///

    modifier isVaultOpenForMsgSender(IHToken hToken) {
        require(vaults[hToken][msg.sender].isOpen, "VAULT_NOT_OPEN");
        _;
    }

    /// @param fintroller_ The address of the Fintroller contract.
    constructor(IFintroller fintroller_) Admin() {
        // Set the hToken contract and sanity check it.
        fintroller = fintroller_;
        fintroller.isFintroller();
    }

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IBalanceSheet
    function clutchCollateral(
        IHToken hToken,
        address liquidator,
        address borrower,
        uint256 collateralAmount
    ) external override nonReentrant {
        // Checks: the caller is the hToken.
        require(msg.sender == address(hToken), "CLUTCH_COLLATERAL_NOT_AUTHORIZED");

        // Checks: there is enough clutchable collateral in the vault.
        uint256 lockedCollateral = vaults[hToken][borrower].lockedCollateral;
        require(lockedCollateral >= collateralAmount, "INSUFFICIENT_LOCKED_COLLATERAL");

        // Calculate the new locked collateral amount.
        uint256 newLockedCollateral = lockedCollateral - collateralAmount;

        // Effects: update the vault.
        vaults[hToken][borrower].lockedCollateral = newLockedCollateral;

        // Interactions: transfer the collateral.
        hToken.collateral().safeTransfer(liquidator, collateralAmount);

        emit ClutchCollateral(hToken, liquidator, borrower, collateralAmount);
    }

    /// @inheritdoc IBalanceSheet
    function decreaseVaultDebt(
        IHToken hToken,
        address borrower,
        uint256 subtractedDebt
    ) external override {
        // Checks: the caller is the hToken.
        require(msg.sender == address(hToken), "DECREASE_VAULT_DEBT_NOT_AUTHORIZED");

        // Effects: update storage.
        uint256 oldVaultDebt = vaults[hToken][borrower].debt;
        vaults[hToken][borrower].debt -= subtractedDebt;

        emit DecreaseVaultDebt(hToken, borrower, oldVaultDebt, vaults[hToken][borrower].debt);
    }

    /// @inheritdoc IBalanceSheet
    function depositCollateral(IHToken hToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(hToken)
        nonReentrant
    {
        // Checks: the zero edge case.
        require(collateralAmount > 0, "DEPOSIT_COLLATERAL_ZERO");

        // Checks: the Fintroller allows this action to be performed.
        require(fintroller.getDepositCollateralAllowed(hToken), "DEPOSIT_COLLATERAL_NOT_ALLOWED");

        // Effects: update storage.
        uint256 hypotheticalFreeCollateral = vaults[hToken][msg.sender].freeCollateral + collateralAmount;
        vaults[hToken][msg.sender].freeCollateral = hypotheticalFreeCollateral;

        // Interactions: perform the Erc20 transfer.
        hToken.collateral().safeTransferFrom(msg.sender, address(this), collateralAmount);

        emit DepositCollateral(hToken, msg.sender, collateralAmount);
    }

    /// @inheritdoc IBalanceSheet
    function freeCollateral(IHToken hToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(hToken)
    {
        // Checks: the zero edge case.
        require(collateralAmount > 0, "FREE_COLLATERAL_ZERO");

        // Checks: enough locked collateral.
        Vault memory vault = vaults[hToken][msg.sender];
        require(vault.lockedCollateral >= collateralAmount, "INSUFFICIENT_LOCKED_COLLATERAL");
        uint256 newLockedCollateral = vault.lockedCollateral - collateralAmount;

        // Checks: the hypothetical collateralization ratio is above the threshold.
        if (vault.debt > 0) {
            uint256 hypotheticalCollateralizationRatio =
                getHypotheticalCollateralizationRatio(hToken, msg.sender, newLockedCollateral, vault.debt);
            uint256 bondCollateralizationRatio = fintroller.getBondCollateralizationRatio(hToken);
            require(hypotheticalCollateralizationRatio >= bondCollateralizationRatio, "BELOW_COLLATERALIZATION_RATIO");
        }

        // Effects: update storage.
        vaults[hToken][msg.sender].lockedCollateral = newLockedCollateral;
        uint256 newFreeCollateral = vault.freeCollateral + collateralAmount;
        vaults[hToken][msg.sender].freeCollateral = newFreeCollateral;

        emit FreeCollateral(hToken, msg.sender, collateralAmount);
    }

    /// @inheritdoc IBalanceSheet
    function increaseVaultDebt(
        IHToken hToken,
        address borrower,
        uint256 addedDebt
    ) external override {
        // Checks: the caller is the hToken.
        require(msg.sender == address(hToken), "INCREASE_VAULT_DEBT_NOT_AUTHORIZED");

        // Effects: update storage.
        uint256 oldVaultDebt = vaults[hToken][borrower].debt;
        vaults[hToken][borrower].debt += addedDebt;

        emit IncreaseVaultDebt(hToken, borrower, oldVaultDebt, vaults[hToken][borrower].debt);
    }

    /// @inheritdoc IBalanceSheet
    function lockCollateral(IHToken hToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(hToken)
    {
        // Avoid the zero edge case.
        require(collateralAmount > 0, "LOCK_COLLATERAL_ZERO");

        Vault memory vault = vaults[hToken][msg.sender];
        require(vault.freeCollateral >= collateralAmount, "INSUFFICIENT_FREE_COLLATERAL");

        uint256 newLockedCollateral = vault.lockedCollateral + collateralAmount;
        vaults[hToken][msg.sender].lockedCollateral = newLockedCollateral;

        uint256 hypotheticalFreeCollateral = vault.freeCollateral - collateralAmount;
        vaults[hToken][msg.sender].freeCollateral = hypotheticalFreeCollateral;

        emit LockCollateral(hToken, msg.sender, collateralAmount);
    }

    /// @inheritdoc IBalanceSheet
    function openVault(IHToken hToken) external override {
        require(fintroller.isBondListed(hToken), "BOND_NOT_LISTED");
        require(hToken.isHToken(), "OPEN_VAULT_HTOKEN_INSPECTION");
        require(vaults[hToken][msg.sender].isOpen == false, "VAULT_OPEN");
        vaults[hToken][msg.sender].isOpen = true;
        emit OpenVault(hToken, msg.sender);
    }

    /// @inheritdoc IBalanceSheet
    function withdrawCollateral(IHToken hToken, uint256 collateralAmount)
        external
        override
        isVaultOpenForMsgSender(hToken)
        nonReentrant
    {
        // Checks: the zero edge case.
        require(collateralAmount > 0, "WITHDRAW_COLLATERAL_ZERO");

        // Checks: there is enough free collateral.
        require(vaults[hToken][msg.sender].freeCollateral >= collateralAmount, "INSUFFICIENT_FREE_COLLATERAL");

        // Effects: update storage.
        uint256 newFreeCollateral = vaults[hToken][msg.sender].freeCollateral - collateralAmount;
        vaults[hToken][msg.sender].freeCollateral = newFreeCollateral;

        // Interactions: perform the Erc20 transfer.
        hToken.collateral().safeTransfer(msg.sender, collateralAmount);

        emit WithdrawCollateral(hToken, msg.sender, collateralAmount);
    }

    /// CONSTANT FUNCTIONS ///

    /// @inheritdoc IBalanceSheet
    function getClutchableCollateral(IHToken hToken, uint256 repayAmount) external view override returns (uint256) {
        // Avoid the zero edge cases.
        require(repayAmount > 0, "GET_CLUTCHABLE_COLLATERAL_ZERO");

        // When the liquidation incentive is zero, the end result would be zero anyways.
        uint256 liquidationIncentive = fintroller.getBondLiquidationIncentive(hToken);
        if (liquidationIncentive == 0) {
            return 0;
        }

        // Grab the normalized USD price of the underlying.
        IChainlinkOperator oracle = fintroller.oracle();
        uint256 normalizedUnderlyingPrice = oracle.getAdjustedPrice(hToken.underlying().symbol());

        // Grab the normalized USD price of the collateral.
        uint256 normalizedCollateralPrice = oracle.getAdjustedPrice(hToken.collateral().symbol());

        // Calculate the top part of the equation.
        uint256 numerator = repayAmount.mul(liquidationIncentive.mul(normalizedUnderlyingPrice));

        // Calculate the normalized clutched collateral amount.
        uint256 normalizedClutchableCollateralAmount = numerator.div(normalizedCollateralPrice);

        // If the precision scalar is not 1, calculate the final form of the clutched collateral amount.
        uint256 collateralPrecisionScalar = hToken.collateralPrecisionScalar();
        uint256 clutchableCollateralAmount;
        if (collateralPrecisionScalar != 1) {
            clutchableCollateralAmount = normalizedClutchableCollateralAmount / collateralPrecisionScalar;
        } else {
            clutchableCollateralAmount = normalizedClutchableCollateralAmount;
        }

        return clutchableCollateralAmount;
    }

    /// @inheritdoc IBalanceSheet
    function getCurrentCollateralizationRatio(IHToken hToken, address borrower) public view override returns (uint256) {
        Vault memory vault = vaults[hToken][borrower];
        return getHypotheticalCollateralizationRatio(hToken, borrower, vault.lockedCollateral, vault.debt);
    }

    /// @inheritdoc IBalanceSheet
    function getHypotheticalCollateralizationRatio(
        IHToken hToken,
        address borrower,
        uint256 lockedCollateral,
        uint256 debt
    ) public view override returns (uint256) {
        // If the vault is not open, a hypothetical collateralization ratio cannot be calculated.
        require(vaults[hToken][borrower].isOpen, "VAULT_NOT_OPEN");

        // Avoid the zero edge cases.
        if (lockedCollateral == 0) {
            return 0;
        }
        require(debt > 0, "GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_DEBT_ZERO");

        // Grab the normalized USD price of the collateral.
        IChainlinkOperator oracle = fintroller.oracle();
        uint256 normalizedCollateralPrice = oracle.getAdjustedPrice(hToken.collateral().symbol());

        // Grab the normalized USD price of the underlying.
        uint256 normalizedUnderlyingPrice = oracle.getAdjustedPrice(hToken.underlying().symbol());

        // Normalize the collateral amount.
        uint256 collateralPrecisionScalar = hToken.collateralPrecisionScalar();
        uint256 normalizedLockedCollateral;
        if (collateralPrecisionScalar != 1) {
            normalizedLockedCollateral = lockedCollateral * collateralPrecisionScalar;
        } else {
            normalizedLockedCollateral = lockedCollateral;
        }

        // Calculate the USD value of the collateral.
        uint256 lockedCollateralValueUsd = normalizedLockedCollateral.mul(normalizedCollateralPrice);

        // Calculate the USD value of the debt.
        uint256 debtValueUsd = debt.mul(normalizedUnderlyingPrice);

        // Calculate the collateralization ratio by dividing the USD value of the hypothetical locked collateral by
        // the USD value of the debt.
        uint256 hypotheticalCollateralizationRatio = lockedCollateralValueUsd.div(debtValueUsd);

        return hypotheticalCollateralizationRatio;
    }

    /// @inheritdoc IBalanceSheet
    function getVault(IHToken hToken, address borrower) external view override returns (Vault memory) {
        return vaults[hToken][borrower];
    }

    /// @inheritdoc IBalanceSheet
    function getVaultDebt(IHToken hToken, address borrower) external view override returns (uint256) {
        return vaults[hToken][borrower].debt;
    }

    /// @inheritdoc IBalanceSheet
    function getVaultLockedCollateral(IHToken hToken, address borrower) external view override returns (uint256) {
        return vaults[hToken][borrower].lockedCollateral;
    }

    /// @inheritdoc IBalanceSheet
    function isAccountUnderwater(IHToken hToken, address borrower) external view override returns (bool) {
        Vault memory vault = vaults[hToken][borrower];
        if (!vault.isOpen || vault.debt == 0) {
            return false;
        }
        uint256 currentCollateralizationRatio = getCurrentCollateralizationRatio(hToken, borrower);
        uint256 thresholdCollateralizationRatio = fintroller.getBondCollateralizationRatio(hToken);
        return currentCollateralizationRatio < thresholdCollateralizationRatio;
    }

    /// @inheritdoc IBalanceSheet
    function isVaultOpen(IHToken hToken, address borrower) external view override returns (bool) {
        return vaults[hToken][borrower].isOpen;
    }
}
