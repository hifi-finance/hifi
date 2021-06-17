// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/token/erc20/IErc20.sol";

import "../fintroller/IFintrollerV1.sol";
import "../hToken/IHToken.sol";
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

    /// @notice The Fintroller contract associated with this contract.
    IFintrollerV1 public fintroller;

    /// @notice The contract that provides price data.
    IChainlinkOperator public oracle;

    /// @dev Borrower vaults.
    mapping(address => Vault) internal vaults;
}
