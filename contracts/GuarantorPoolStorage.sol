/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./erc20/Erc20Interface.sol";
import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";

/**
 * @notice GuarantorPoolStorage
 * @author Mainframe
 */
abstract contract GuarantorPoolStorage {
    /**
     * @notice The Erc20 asset that is used to liquidate under-collateralized users.
     */
    Erc20Interface public guaranty;

    /**
     * @notice The unique Fintroller associated with this contract.
     */
    FintrollerInterface public fintroller;

    /**
     * @notice The total amount of liquid assets that this contracts holds.
     */
    uint256 public totalGuaranty;

    /**
     * @notice The unique yToken associated with this contract.
     */
    YTokenInterface public yToken;

    /**
     * @notice The contract burn the first 1e-15 shares ever minted.
     * @dev This prevents an attacker from taking the price of one share (1e-18) to an abnormally high value.
     * Refer to section 3.4 from the Uniswap v2 whitepaper.
     */
    uint16 public constant minimumShares = 1000;

    /**
     * @notice Indicator that this is a Guarantor Pool contract, for inspection.
     */
    bool public constant isGuarantorPool = true;
}
