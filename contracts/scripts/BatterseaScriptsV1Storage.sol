/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "../external/balancer/ExchangeProxyInterface.sol";
import "../external/weth/WethInterface.sol";

/**
 * @title BatterseaScriptsV1Storage
 * @author Mainframe
 * @notice Storage contract for BatterseaScriptsV1.
 */
abstract contract BatterseaScriptsV1Storage {
    /**
     * @notice The contract that enables trading on the Balancer Exchange.
     */
    ExchangeProxyInterface public exchangeProxy;

    /**
     * @notice The contract that enables wrapping ETH into ERC-20 form.
     */
    WethInterface public weth;
}
