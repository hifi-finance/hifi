/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

/**
 * @title BatterseaScriptsV1Storage
 * @author Hifi
 * @notice Storage contract for BatterseaScriptsV1.
 */
abstract contract BatterseaScriptsV1Storage {
    /**
     * @notice The contract that enables trading on the Balancer Exchange.
     * @dev This is the mainnet version of the Exchange Proxy. Change it with the testnet version when needed.
     */
    address public constant EXCHANGE_PROXY_ADDRESS = 0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21;

    /**
     * @notice The contract that enables wrapping ETH into ERC-20 form.
     * @dev This is the mainnet version of WETH. Change it with the testnet version when needed.
     */
    address public constant WETH_ADDRESS = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
}
