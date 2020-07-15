/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

/**
 * @notice GuarantorPoolInterface
 * @author Mainframe
 */
abstract contract GuarantorPoolInterface {
    function deposit() external virtual returns (bool);
}
