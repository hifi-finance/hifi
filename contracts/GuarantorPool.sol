/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./GuarantorPoolInterface.sol";
import "./erc20/Erc20.sol";
import "./erc20/Erc20Interface.sol";
import "./erc20/SafeErc20.sol";
import "./math/Exponential.sol";
import "./utils/Admin.sol";
import "./utils/ErrorReporter.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title GuarantorPool
 * @author Mainframe
 */
contract GuarantorPool is GuarantorPoolInterface, Erc20, Admin, ErrorReporter, Exponential, ReentrancyGuard {
    using SafeErc20 for Erc20Interface;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) Erc20(name_, symbol_, decimals_) Admin() {} /* solhint-disable-line no-empty-blocks */

    /**
     * NON-CONSTANT FUNCTIONS
     */
    function supplyLiquidity(uint256 amount) external override pure returns (bool) {
        amount;
        return NO_ERROR;
    }

    function withdrawLiquidity(uint256 amount) external override pure returns (bool) {
        amount;
        return NO_ERROR;
    }
}
