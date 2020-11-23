/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "../external/weth/WethInterface.sol";

/**
 * @title BatterseaScriptsV1Storage
 * @author Mainframe
 * @notice Storage contract for BatterseaScriptsV1.
 */
abstract contract BatterseaScriptsV1Storage {
    WethInterface public weth;
}
