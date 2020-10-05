/* SPDX-License-Identifier: LGPL-3.0-or-later */
/* solhint-disable func-name-mixedcase */
pragma solidity ^0.7.1;

import "../erc20/Erc20Recover.sol";

/**
 * @title GodModeErc20Recover
 * @author Mainframe
 * @dev Strictly for test purposes. Do not use in production.
 */
contract GodModeErc20Recover is Erc20Recover {
    function __godMode_setIsInitialized(bool state) external {
        isInitialized = state;
    }
}
