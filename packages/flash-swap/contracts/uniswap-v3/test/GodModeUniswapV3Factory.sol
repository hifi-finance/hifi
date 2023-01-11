// SPDX-License-Identifier: UNLICENSED
// solhint-disable
pragma solidity =0.7.6;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "./GodModeUniswapV3Pool.sol";

/// @dev https://raw.githubusercontent.com/Uniswap/uniswap-v3-core/v1.0.0/contracts/UniswapV3Factory.sol
contract GodModeUniswapV3Factory is IUniswapV3Factory {
    address public override owner;

    mapping(uint24 => int24) public override feeAmountTickSpacing;
    mapping(address => mapping(address => mapping(uint24 => address))) public override getPool;

    struct Parameters {
        address factory;
        address token0;
        address token1;
        uint24 fee;
        int24 tickSpacing;
    }

    Parameters public parameters;

    constructor() {
        owner = msg.sender;
        feeAmountTickSpacing[500] = 10;
        feeAmountTickSpacing[3000] = 60;
        feeAmountTickSpacing[10000] = 200;
    }

    /// @inheritdoc IUniswapV3Factory
    function createPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external override returns (address pool) {
        require(tokenA != tokenB, "UniswapV3: IDENTICAL_ADDRESSES");
        address token0 = tokenA;
        address token1 = tokenB;
        require(token0 != address(0), "UniswapV3: ZERO_ADDRESS");
        int24 tickSpacing = feeAmountTickSpacing[fee];
        require(tickSpacing != 0, "UniswapV3: TICK_SPACING_ZERO");
        require(getPool[token0][token1][fee] == address(0), "UniswapV3: PAIR_EXISTS");
        pool = deploy(address(this), token0, token1, fee, tickSpacing);
        getPool[token0][token1][fee] = pool;
        // populate mapping in the reverse direction, deliberate choice to avoid the cost of comparing addresses
        getPool[token1][token0][fee] = pool;
        emit PoolCreated(token0, token1, fee, tickSpacing, pool);
    }

    function setOwner(address _owner) external override {
        require(msg.sender == owner, "UniswapV3: FORBIDDEN");
        owner = _owner;
    }

    function enableFeeAmount(uint24 fee, int24 tickSpacing) public override {
        require(msg.sender == owner, "UniswapV3: FORBIDDEN");
        feeAmountTickSpacing[fee] = tickSpacing;
    }

    function deploy(
        address factory,
        address token0,
        address token1,
        uint24 fee,
        int24 tickSpacing
    ) internal returns (address pool) {
        parameters = Parameters({
            factory: factory,
            token0: token0,
            token1: token1,
            fee: fee,
            tickSpacing: tickSpacing
        });
        pool = address(new UniswapV3Pool{ salt: keccak256(abi.encode(token0, token1, fee)) }());
        delete parameters;
    }
}
