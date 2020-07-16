/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./GuarantorPoolInterface.sol";
import "./erc20/Erc20Interface.sol";
import "./governance/MfAdmin.sol";
import "./math/Exponential.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title GuarantorPool
 * @author Mainframe
 */
contract GuarantorPool is GuarantorPoolInterface, MfAdmin, Exponential, ReentrancyGuard {
    modifier isCollateralAuthorized(address collateral) {
        require(supportedCollaterals[collateral] == true, "ERR_COLLATERAL_NOT_AUTHORIZED");
        _;
    }

    /* solhint-disable-next-line */
    constructor() public MfAdmin() {}

    struct RedeemLocalVars {
        MathError mathErr;
        uint256 currentEndowment;
        uint256 newEndowment;
    }

    /**
     * @notice Lorem ipsum.
     * @dev WARNING: there's a risk of a liquidity crunch ...
     */
    function redeem(address collateral, uint256 endowment) external override returns (bool) {
        /* Checks: The caller has an insufficient balance. */
        require(endowments[msg.sender][collateral] >= endowment, "ERR_WITHDRAW_ENDOWMENT_INSUFFICIENT_BALANCE");

        /* Checks: liquidity situation */
        /* TODO */

        /* Effects: Update the storage properties/ */
        RedeemLocalVars memory vars;
        vars.currentEndowment = endowments[msg.sender][collateral];
        (vars.mathErr, vars.newEndowment) = subUInt(vars.currentEndowment, endowment);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_WITHDRAW_ENDOWMENT_MATH_ERR");
        endowments[msg.sender][collateral] = vars.newEndowment;

        /* Interactions: Attempt to perform the ERC20 transfer. */
        require(Erc20Interface(collateral).transfer(msg.sender, endowment), "ERR_WITHDRAW_ENDOWMENT_TRANSFER_FROM");
        return true;
    }

    struct SupplyLocalVars {
        MathError mathErr;
        uint256 currentEndowment;
        uint256 newEndowment;
    }

    /**
     * @notice Lorem ipsum.
     */
    function supply(address collateral, uint256 endowment)
        external
        override
        isCollateralAuthorized(collateral)
        returns (bool)
    {
        /* Compute the new total amount endowed by the caller */
        SupplyLocalVars memory vars;
        vars.currentEndowment = endowments[msg.sender][collateral];
        (vars.mathErr, vars.newEndowment) = addUInt(vars.currentEndowment, endowment);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_DEPOSIT_ENDOWMENT_MATH_ERR");
        endowments[msg.sender][collateral] = vars.newEndowment;

        /* Attempt to perform the ERC20 transfer */
        require(
            Erc20Interface(collateral).transferFrom(msg.sender, address(this), endowment),
            "ERR_DEPOSIT_ENDOWMENT_TRANSFER_FROM"
        );
        return true;
    }

    /**
     * @notice Lorem ipsum.
     */
    function _authorizeCollateral(address collateral) external override isAuthorized returns (bool) {
        require(supportedCollaterals[collateral] == false, "ERR_COLLATERAL_AUTHORIZED");
        supportedCollaterals[collateral] = true;
        return true;
    }

    /**
     * @notice Lorem ipsum.
     */
    function _disapproveCollateral(address collateral) external override isAuthorized returns (bool) {
        require(supportedCollaterals[collateral] == true, "ERR_COLLATERAL_NOT_AUTHORIZED");
        supportedCollaterals[collateral] = true;
        return true;
    }
}
