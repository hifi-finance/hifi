// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.0;

import "@paulrberg/contracts/token/erc20/Erc20.sol";

/// @title GodModeErc20
/// @author Hifi
/// @notice Token with the ability to mint and burn as many tokens to anyone.
/// @dev Strictly for test purposes.
contract GodModeErc20 is Erc20 {
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) Erc20(name_, symbol_, decimals_) {} // solhint-disable-line no-empty-blocks

    /// @notice Destroys tokens out of existence.
    /// @param holder The account whose tokens to burn.
    /// @param burnAmount The amount of fyTokens to destroy.
    /// @return bool true = success, otherwise it reverts.
    function burn(address holder, uint256 burnAmount) external returns (bool) {
        burnInternal(holder, burnAmount);
        return true;
    }

    /// @notice Prints new tokens into existence.
    /// @param beneficiary The account for which to mint the tokens.
    /// @param mintAmount The amount of fyTokens to print into existence.
    /// @return bool true = success, otherwise it reverts.
    function mint(address beneficiary, uint256 mintAmount) external returns (bool) {
        mintInternal(beneficiary, mintAmount);
        return true;
    }
}
