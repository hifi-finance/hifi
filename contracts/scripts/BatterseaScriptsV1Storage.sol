/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

/**
 * @title BatterseaScriptsV1Storage
 * @author Mainframe
 * @notice Storage contract for BatterseaScriptsV1.
 */
abstract contract BatterseaScriptsV1Storage {
    /**
     * @notice The contract that enables trading on the Balancer Exchange.
     * @dev This is the mainnet version of the Exchange Proxy. Change it with the testnet version when needed.
     */
    address public constant EXCHANGE_PROXY_ADDRESS = 0x4e67bf5bD28Dd4b570FBAFe11D0633eCbA2754Ec;

    /**
     * @notice The contract that enables wrapping ETH into ERC-20 form.
     * @dev This is the mainnet version of WETH. Change it with the testnet version when needed.
     */
    address public constant WETH_ADDRESS = 0xd0A1E359811322d97991E03f863a0C30C2cF029C;
}
