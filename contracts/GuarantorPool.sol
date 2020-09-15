/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./GuarantorPoolInterface.sol";
import "./erc20/Erc20.sol";
import "./erc20/Erc20Interface.sol";
import "./erc20/SafeErc20.sol";
import "./math/Exponential.sol";
import "./utils/Admin.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title GuarantorPool
 * @author Mainframe
 */
contract GuarantorPool is GuarantorPoolInterface, Erc20, Admin, Exponential, ReentrancyGuard {
    using SafeErc20 for Erc20Interface;

    modifier isCollateralAuthorized(address collateral) {
        require(supportedCollaterals[collateral] == true, "ERR_COLLATERAL_NOT_AUTHORIZED");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) Erc20(name_, symbol_, decimals_) Admin() {} /* solhint-disable-line no-empty-blocks */

    struct RedeemUnderlyingLocalVars {
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
        require(endowments[msg.sender][collateral] >= endowment, "ERR_WITHDRAW_INSUFFICIENT_ENDOWMENT_BALANCET");

        /* Checks: liquidity situation */
        /* TODO */

        /* Effects: update the storage properties/ */
        RedeemUnderlyingLocalVars memory vars;
        vars.currentEndowment = endowments[msg.sender][collateral];
        (vars.mathErr, vars.newEndowment) = subUInt(vars.currentEndowment, endowment);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_WITHDRAW_ENDOWMENT_MATH_ERROR");
        endowments[msg.sender][collateral] = vars.newEndowment;

        /* Interactions: perform the Erc20 transfer. */
        Erc20Interface(collateral).safeTransfer(msg.sender, endowment);

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
        require(vars.mathErr == MathError.NO_ERROR, "ERR_SUPPLY_MATH_ERROR");

        /* Effects: update the storage property. */
        endowments[msg.sender][collateral] = vars.newEndowment;

        /* Effects: mint new ownership tokens */
        // TODO

        /* Interactions: perform the ERC20 transfer. */
        Erc20Interface(collateral).safeTransferFrom(msg.sender, address(this), endowment);

        return true;
    }

    /**
     * @notice Lorem ipsum.
     */
    function _authorizeCollateral(address collateral) external override onlyAdmin returns (bool) {
        require(supportedCollaterals[collateral] == false, "ERR_COLLATERAL_AUTHORIZED");
        supportedCollaterals[collateral] = true;
        return true;
    }

    /**
     * @notice Lorem ipsum.
     */
    function _disapproveCollateral(address collateral) external override onlyAdmin returns (bool) {
        require(supportedCollaterals[collateral] == true, "ERR_COLLATERAL_NOT_AUTHORIZED");
        supportedCollaterals[collateral] = true;
        return true;
    }
}
