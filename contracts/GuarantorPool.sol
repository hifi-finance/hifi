/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./GuarantorPoolInterface.sol";
import "./erc20/Erc20.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title GuarantorPool
 * @author Mainframe
 */
abstract contract GuarantorPool is GuarantorPoolInterface, Erc20, ReentrancyGuard {

    /* solhint-disable-next-line */
    constructor() public {}

    /**
     * @notice Lorem ipsum.
     */
    function deposit() external override returns (bool) {
        return true;
    }
}
