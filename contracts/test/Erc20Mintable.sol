/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/token/erc20/Erc20.sol";

/// @title Erc20Mintable
/// @author Hifi
/// @notice Token with the ability to mint as many tokens to anyone.
/// @dev Strictly for test purposes.
contract Erc20Mintable is Erc20 {
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) Erc20(name_, symbol_, decimals_) {
        // solhint-disable-previous-line no-empty-blocks
    }

    /// @notice Prints new tokens into existence.
    /// @param beneficiary The account for which to mint the tokens.
    /// @param mintAmount The amount of hTokens to print into existence.
    function mint(address beneficiary, uint256 mintAmount) external {
        mintInternal(beneficiary, mintAmount);
    }
}
