import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { Token } from "@uniswap/sdk-core";
import { Pool, Position, computePoolAddress, nearestUsableTick } from "@uniswap/v3-sdk";
import bn from "bignumber.js";

import { GodModeErc20, UniswapV3Pool, UniswapV3Pool__factory } from "../../src/types";

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

export async function increaseUniswapV2PoolReserves(
  this: Mocha.Context,
  wbtcAmount: BigNumber,
  usdcAmount: BigNumber,
): Promise<void> {
  // Mint WBTC to the pair contract.
  if (!wbtcAmount.isZero()) {
    await this.contracts.wbtc.__godMode_mint(this.contracts.uniswapV2Pair.address, wbtcAmount);
  }

  // Mint USDC to the pair contract.
  if (!usdcAmount.isZero()) {
    await this.contracts.usdc.__godMode_mint(this.contracts.uniswapV2Pair.address, usdcAmount);
  }

  // Sync the token reserves in the UniswapV2Pair contract.
  await this.contracts.uniswapV2Pair.sync();
}

export async function reduceUniswapV2PoolReserves(
  this: Mocha.Context,
  wbtcAmount: BigNumber,
  usdcAmount: BigNumber,
): Promise<void> {
  // Burn WBTC to the pair contract.
  if (!wbtcAmount.isZero()) {
    await this.contracts.wbtc.__godMode_burn(this.contracts.uniswapV2Pair.address, wbtcAmount);
  }

  // Burn USDC to the pair contract.
  if (!usdcAmount.isZero()) {
    await this.contracts.usdc.__godMode_burn(this.contracts.uniswapV2Pair.address, usdcAmount);
  }

  // Sync the token reserves in the UniswapV2Pair contract.
  await this.contracts.uniswapV2Pair.sync();
}

export async function mintUniswapV3PoolReserves(
  this: Mocha.Context,
  token0: GodModeErc20,
  token1: GodModeErc20,
  fee: number,
  reserve0: string,
  reserve1: string,
  mintLiquidity: string,
): Promise<void> {
  await this.contracts.uniswapV3PositionManager.createAndInitializePoolIfNecessary(
    token0.address,
    token1.address,
    fee,
    new bn(reserve1).div(reserve0).sqrt().multipliedBy(new bn(2).pow(96)).integerValue(3).toString(),
  );

  let usdc, wbtc;
  {
    const { name, symbol, decimals } = token0;
    wbtc = new Token(31337, token0.address, await decimals(), await symbol(), await name());
  }
  {
    const { name, symbol, decimals } = token1;
    usdc = new Token(31337, token1.address, await decimals(), await symbol(), await name());
  }

  const uniswapV3Pool: UniswapV3Pool = UniswapV3Pool__factory.connect(
    computePoolAddress({
      factoryAddress: await this.contracts.uniswapV3PositionManager.factory(),
      tokenA: wbtc,
      tokenB: usdc,
      fee: fee,
    }),
    this.signers.admin,
  );

  const [tickSpacing, liquidity, [sqrtPriceX96, tick]] = await Promise.all([
    uniswapV3Pool.tickSpacing(),
    uniswapV3Pool.liquidity(),
    uniswapV3Pool.slot0(),
  ]);

  const pool = new Pool(wbtc, usdc, fee, sqrtPriceX96.toString(), liquidity.toString(), tick);

  const position = new Position({
    pool: pool,
    liquidity: mintLiquidity,
    tickLower: nearestUsableTick(tick, tickSpacing) - tickSpacing * 2,
    tickUpper: nearestUsableTick(tick, tickSpacing) + tickSpacing * 2,
  });

  const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

  // Mint WBTC to the admin address.
  await token0.__godMode_mint(this.signers.admin.address, amount0Desired.toString());

  // Mint USDC to the admin address.
  await token1.__godMode_mint(this.signers.admin.address, amount1Desired.toString());

  await token0.approve(this.contracts.uniswapV3PositionManager.address, amount0Desired.toString());

  await token1.approve(this.contracts.uniswapV3PositionManager.address, amount1Desired.toString());

  await this.contracts.uniswapV3PositionManager.mint(
    {
      token0: token0.address,
      token1: token1.address,
      fee: fee,
      tickLower: nearestUsableTick(tick, tickSpacing) - tickSpacing * 2,
      tickUpper: nearestUsableTick(tick, tickSpacing) + tickSpacing * 2,
      amount0Desired: amount0Desired.toString(),
      amount1Desired: amount1Desired.toString(),
      amount0Min: Zero,
      amount1Min: Zero,
      recipient: this.signers.admin.address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    },
    { gasLimit: "1000000" },
  );
}
