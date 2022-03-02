// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";

import "../fintroller/IFintroller.sol";
import "../h-token/IHToken.sol";
import "../../oracles/IChainlinkOperator.sol";

/// @title SBalanceSheetV1
/// @author Hifi
abstract contract SBalanceSheetV1 {
    /// STRUCTS ///

    /// @notice Structure of a vault.
    struct Vault {
        IHToken[] bondList;
        mapping(IErc20 => uint256) collateralAmounts;
        IErc20[] collateralList;
        mapping(IHToken => uint256) debtAmounts;
    }

    /// PUBLIC STORAGE ///

    /// @notice The Fintroller contraMct associated with this contract.
    IFintroller public fintroller;

    /// @notice The contract that provides price data.
    IChainlinkOperator public oracle;

    /// @dev Borrower vaults.
    mapping(address => Vault) internal vaults;
}
