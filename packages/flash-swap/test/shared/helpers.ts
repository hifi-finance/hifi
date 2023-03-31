import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { Token } from "@uniswap/sdk-core";
import { Pool, Position, nearestUsableTick } from "@uniswap/v3-sdk";
import bn from "bignumber.js";

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

export async function mintUniswapV3PoolReserves(this: Mocha.Context, mintLiquidity: string): Promise<void> {
  // Create a position with price range 1 WBTC ~ 20k USDC.
  const [reserve0, reserve1] = ["1", "250"];
  await this.contracts.uniswapV3PositionManager.createAndInitializePoolIfNecessary(
    this.contracts.wbtc.address,
    this.contracts.usdc.address,
    500,
    new bn(reserve1).div(reserve0).sqrt().multipliedBy(new bn(2).pow(96)).integerValue(3).toString(),
  );

  const [tickSpacing, fee, liquidity, [sqrtPriceX96, tick]] = await Promise.all([
    this.contracts.uniswapV3Pool.tickSpacing(),
    this.contracts.uniswapV3Pool.fee(),
    this.contracts.uniswapV3Pool.liquidity(),
    this.contracts.uniswapV3Pool.slot0(),
  ]);

  let usdc, wbtc;
  {
    const { name, symbol, decimals } = this.contracts.wbtc;
    wbtc = new Token(31337, this.contracts.wbtc.address, await decimals(), await symbol(), await name());
  }
  {
    const { name, symbol, decimals } = this.contracts.usdc;
    usdc = new Token(31337, this.contracts.usdc.address, await decimals(), await symbol(), await name());
  }

  const pool = new Pool(wbtc, usdc, fee, sqrtPriceX96.toString(), liquidity.toString(), tick);

  const position = new Position({
    pool: pool,
    liquidity: mintLiquidity,
    tickLower: nearestUsableTick(tick, tickSpacing) - tickSpacing * 2,
    tickUpper: nearestUsableTick(tick, tickSpacing) + tickSpacing * 2,
  });

  const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

  // Mint WBTC to the admin address.
  await this.contracts.wbtc.__godMode_mint(this.signers.admin.address, amount0Desired.toString());

  // Mint USDC to the admin address.
  await this.contracts.usdc.__godMode_mint(this.signers.admin.address, amount1Desired.toString());

  await this.contracts.wbtc.approve(this.contracts.uniswapV3PositionManager.address, amount0Desired.toString());

  await this.contracts.usdc.approve(this.contracts.uniswapV3PositionManager.address, amount1Desired.toString());

  await this.contracts.uniswapV3PositionManager.mint(
    {
      token0: this.contracts.wbtc.address,
      token1: this.contracts.usdc.address,
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
