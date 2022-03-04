// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/balance-sheet/IBalanceSheetV2.sol";
import "@hifi/protocol/contracts/core/fintroller/IFintroller.sol";
import "@hifi/protocol/contracts/core/h-token/HToken.sol";
import "@paulrberg/contracts/token/erc20/IErc20.sol";

/// @title GodModeHToken
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeHToken is HToken {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maturity_,
        IErc20 underlying_
    ) HToken(name_, symbol_, maturity_, IBalanceSheetV2(address(0)), IFintroller(address(0)), underlying_) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function __godMode_mint(address beneficiary, uint256 mintAmount) external {
        mintInternal(beneficiary, mintAmount);
    }
}
