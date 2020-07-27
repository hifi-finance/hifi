/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./GuarantorPoolInterface.sol";
import "./erc20/Erc20.sol";
import "./erc20/Erc20Interface.sol";
import "./governance/Admin.sol";
import "./math/Exponential.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title GuarantorPool
 * @author Mainframe
 */
contract GuarantorPool is GuarantorPoolInterface, Erc20, Admin, Exponential, ReentrancyGuard {
    modifier isCollateralAuthorized(address collateral) {
        require(supportedCollaterals[collateral] == true, "ERR_COLLATERAL_NOT_AUTHORIZED");
        _;
    }

    /* solhint-disable-next-line */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) public Erc20(name_, symbol_, decimals_) Admin() {}

    struct RedeemLocalVars {
        MathError mathErr;
        uint256 currentEndowment;
        uint256 newEndowment;
    }

    /**
     * @notice Lorem ipsum.
     * @dev WARNING: there's a risk of a liquidity crunch ...
     */
    function redeemEndowment(address collateral, uint256 endowment) external override returns (bool) {
        /* Checks: verify endowment balance. */
        require(endowments[msg.sender][collateral] >= endowment, "ERR_WITHDRAW_ENDOWMENT_BALANCE_INSUFFICIENT");

        /* Checks: liquidity situation */
        /* TODO */

        /* Effects: update the storage properties/ */
        RedeemLocalVars memory vars;
        vars.currentEndowment = endowments[msg.sender][collateral];
        (vars.mathErr, vars.newEndowment) = subUInt(vars.currentEndowment, endowment);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_WITHDRAW_ENDOWMENT_MATH_ERROR");
        endowments[msg.sender][collateral] = vars.newEndowment;

        /* Interactions: attempt to perform the ERC20 transfer. */
        require(Erc20Interface(collateral).transfer(msg.sender, endowment), "ERR_REDEEM_ENDOWMENT_ERC20_TRANSFER");
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
        /* Checks: compute the new total amount endowed by the caller */
        SupplyLocalVars memory vars;
        vars.currentEndowment = endowments[msg.sender][collateral];
        (vars.mathErr, vars.newEndowment) = addUInt(vars.currentEndowment, endowment);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_DEPOSIT_ENDOWMENT_MATH_ERROR");

        /* Effects: update the endowment storage property. */
        endowments[msg.sender][collateral] = vars.newEndowment;

        /* Effects: mint new ownership tokens */
        // TODO

        /* Interactions: attempt to perform the ERC20 transfer */
        require(
            Erc20Interface(collateral).transferFrom(msg.sender, address(this), endowment),
            "ERR_SUPPLY_ENDOWMENT_ERC20_TRANSFER"
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
