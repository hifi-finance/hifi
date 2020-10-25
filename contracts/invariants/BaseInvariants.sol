/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

abstract contract BaseInvariants {
    address private constant deployer = address(0x1000);
    address private constant caller1 = address(0x20000);
}
