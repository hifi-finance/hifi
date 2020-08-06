/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";
import "./math/Exponential.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";

/**
 * @notice Fintroller
 * @author Mainframe
 */
contract Fintroller is FintrollerInterface, Admin, ErrorReporter {
    /* solhint-disable-next-line */
    constructor() public Admin() {}

    /*** View Functions ***/

    /**
     * @notice Checks if the user should be allowed to deposit new collateral.
     * @dev Reverts it the bond is not listed.
     * @param yToken The bond to verify the check against.
     * @return bool true=allowed, false=not allowed.
     */
    function depositAllowed(YTokenInterface yToken) external override view returns (bool) {
        Bond memory bond = bonds[address(yToken)];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isDepositAllowed;
    }

    /**
     * @notice Checks if the user should be allowed to mint new tokens.
     * @dev Reverts it the bond is not listed.
     * @param yToken The bond to verify the check against.
     * @return bool true=allowed, false=not allowed.
     */
    function mintAllowed(YTokenInterface yToken) external override view returns (bool) {
        Bond memory bond = bonds[address(yToken)];
        require(bond.isListed, "ERR_BOND_NOT_LISTED");
        return bond.isMintAllowed;
    }

    /*** Non-Constant Functions ***/

    /**
     * @notice Returns the bond with all its properties.
     * @dev It is not an error to provide an invalid yToken address. The returned values will all be zero.
     * @param yTokenAddress The address of the bond contract.
     * @return collateralizationRatioMantissa The bond data.
     */
    function getBond(address yTokenAddress) external view returns (uint256 collateralizationRatioMantissa) {
        collateralizationRatioMantissa = bonds[yTokenAddress].collateralizationRatio.mantissa;
    }

    struct SetCollateralizationRatioLocalVars {
        address yTokenAddress;
    }

    /**
     * @notice Updates the collateralization ratio that ensures that the protocol is
     * sufficiently collateralized.
     *
     * @dev Emits a {SetCollateralizationRatio} event.
     *
     * Requirements:
     * - caller must be the administrator
     * - the bond must be listed
     * - `newCollateralizationRatioMantissa_` cannot be higher than 10,000%
     * - `newCollateralizationRatioMantissa_` cannot be lower than 100%
     *
     * @param yToken The bond for which to update the collateralization ratio.
     * @param newCollateralizationRatioMantissa_ The mantissa value of the new collateralization ratio.
     * @return bool true=success, otherwise it reverts.
     */
    function setCollateralizationRatio(YTokenInterface yToken, uint256 newCollateralizationRatioMantissa_)
        external
        override
        isAuthorized
        returns (bool)
    {
        SetCollateralizationRatioLocalVars memory vars;
        vars.yTokenAddress = address(yToken);

        require(bonds[vars.yTokenAddress].isListed, "ERR_BOND_NOT_LISTED");
        require(
            newCollateralizationRatioMantissa_ <= collateralizationRatioUpperBoundMantissa,
            "ERR_SET_COLLATERALIZATION_RATIO_OVERFLOW"
        );
        require(
            newCollateralizationRatioMantissa_ >= collateralizationRatioLowerBoundMantissa,
            "ERR_SET_COLLATERALIZATION_RATIO_UNDERFLOW"
        );

        uint256 oldCollateralizationRatioMantissa = bonds[vars.yTokenAddress].collateralizationRatio.mantissa;
        bonds[vars.yTokenAddress].collateralizationRatio = Exp({ mantissa: newCollateralizationRatioMantissa_ });

        emit NewCollateralizationRatio(yToken, oldCollateralizationRatioMantissa, newCollateralizationRatioMantissa_);
        return NO_ERROR;
    }

    /**
     * @notice Updates the oracle contract's address saved in storage.
     *
     * @dev Emits a {SetOracle} event.
     *
     * Requirements:
     * - caller must be the administrator
     * - the new address must not be the zero address
     *
     * @param oracle_ The new oracle contract.
     * @return bool true=success, otherwise it reverts.
     */
    function setOracle(DumbOracleInterface oracle_) external override isAuthorized returns (bool) {
        require(address(oracle_) != address(0x00), "ERR_SET_ORACLE_ZERO_ADDRESS");
        address oldOracle = address(oracle);
        oracle = oracle_;
        emit NewOracle(oldOracle, address(oracle));
        return NO_ERROR;
    }

    /*** Admin Functions ***/

    /**
     * @notice Marks the bond as listed in this contract's registry. It is not an error to list a bond twice.
     *
     * @dev Emits a {ListBond} event.
     *
     * Requirements:
     * - caller must be the administrator
     *
     * @param yToken The bond contract to list.
     * @return bool true=success, otherwise it reverts.
     */
    function _listBond(YTokenInterface yToken) external override isAuthorized returns (bool) {
        /* Sanity check */
        yToken.isYToken();
        bonds[address(yToken)] = Bond({
            collateralizationRatio: Exp({ mantissa: 0 }),
            isListed: true,
            isDepositAllowed: true,
            isMintAllowed: true
        });
        emit ListBond(yToken);
        return NO_ERROR;
    }


    function _setMintPaused(YTokenInterface yToken, bool state) public isAuthorized returns (bool) {
        // require(markets[address(cToken)].isListed, "cannot pause a market that is not listed");
        // require(msg.sender == pauseGuardian || msg.sender == admin, "only pause guardian and admin can pause");
        // require(msg.sender == admin || state == true, "only admin can unpause");

        // mintGuardianPaused[address(cToken)] = state;
        // emit ActionPaused(cToken, "Mint", state);
        // return state;
        return true;
    }

    function _setDepositPaused(YTokenInterface yToken, bool state) public isAuthorized returns (bool) {
        // require(markets[address(cToken)].isListed, "cannot pause a market that is not listed");
        // require(msg.sender == pauseGuardian || msg.sender == admin, "only pause guardian and admin can pause");
        // require(msg.sender == admin || state == true, "only admin can unpause");

        // borrowGuardianPaused[address(cToken)] = state;
        // emit ActionPaused(cToken, "Borrow", state);
        // return state;
        return true;
    }
}
