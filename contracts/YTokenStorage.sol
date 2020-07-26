/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./governance/MfAdmin.sol";
import "./math/Exponential.sol";

/**
 * @title YTokenInterface
 * @author Mainframe
 */
contract YTokenStorage is MfAdmin, Exponential {
    /*** Structs ***/
    struct Vault {
        uint256 freeCollateral;
        uint256 lockedCollateral;
        bool isOpen;
    }

    /*** Storage Properties ***/

    /**
     * @notice Collateral Erc20 asset for this YToken.
     */
    address public collateral;

    /**
     * @notice The surplus of collateral that a borrower must deposit in order to mint new tokens.
     */
    Exp public collateralizationRatio;

    /**
     * @notice Unix timestamp in seconds for when this token expires.
     */
    uint256 public expirationTime;

    /**
     * @notice The pool into which Guarantors of this YToken deposit their capital.
     */
    address public guarantorPool;

    /**
     * @notice Provides price information in USD for the collateral and the underlying asset.
     */
    address public oracle;

    /**
     * @notice Underlying Erc20 asset for this YToken.
     */
    address public underlying;

    /**
     * @notice ...
     */
    mapping(address => Vault) public vaults;

    /*** Non-Constant Functions ***/

    function setCollateralizationRatio(uint256 collateralizationRatio_) external returns (bool) {
        collateralizationRatio = Exp({ mantissa: collateralizationRatio_ });
        return true;
    }

    function setOracle(address oracle_) external isAuthorized returns (bool) {
        oracle = oracle_;
        return true;
    }
}
