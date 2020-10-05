/* SPDX-License-Identifier: LGPL-3.0-or-later */
/* solhint-disable var-name-mixedcase */
pragma solidity ^0.7.1;

import "./Erc20PermitStorage.sol";

/**
 * @notice Erc20PermitInterface
 * @author Mainframe
 */
abstract contract Erc20PermitInterface is Erc20PermitStorage {
    /**
     * NON-CONSTANT FUNCTIONS
     */
    function permit(
        address owner,
        address spender,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external virtual;
}
