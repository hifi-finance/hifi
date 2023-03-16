import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { Token } from "@uniswap/sdk-core";
import { Pool, Position, nearestUsableTick } from "@uniswap/v3-sdk";
import bn from "bignumber.js";

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

export async function increasePoolReserves(
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

export async function reducePoolReserves(
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
function encodePriceSqrt(reserve1: string, reserve0: string) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString(),
  );
}

async function getPoolData(poolContract: any): Promise<{
  tickSpacing: number;
  fee: number;
  liquidity: BigNumber;
  sqrtPriceX96: BigNumber;
  tick: number;
}> {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return {
    tickSpacing: tickSpacing as number,
    fee: fee as number,
    liquidity: liquidity as BigNumber,
    sqrtPriceX96: slot0[0] as BigNumber,
    tick: slot0[1] as number,
  };
}
// Creates a new position wrapped in a NFT
export async function mintUniswapV3PoolReserves(this: Mocha.Context, mintLiquidity: string): Promise<void> {
  // Create a position with price range 1 WBTC ~ 20k USDC.
  await this.contracts.nonfungiblePositionManager
    .connect(this.signers.admin)
    .createAndInitializePoolIfNecessary(
      this.contracts.wbtc.address,
      this.contracts.usdc.address,
      500,
      encodePriceSqrt("250", "1"),
    );

  const poolData = await getPoolData(this.contracts.uniswapV3Pool);
  const WbtcToken = new Token(31337, this.contracts.wbtc.address, 8, "WBTC", "WrappedBitcoin");
  const UsdcToken = new Token(31337, this.contracts.usdc.address, 6, "USDC", "UsdCoin");
  const pool = new Pool(
    WbtcToken,
    UsdcToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick,
  );

  const position = new Position({
    pool: pool,
    liquidity: mintLiquidity,
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
  });

  const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

  // Mint WBTC to the admin address.
  await this.contracts.wbtc.__godMode_mint(this.signers.admin.address, amount0Desired.toString());

  // Mint USDC to the admin address.
  await this.contracts.usdc.__godMode_mint(this.signers.admin.address, amount1Desired.toString());

  await this.contracts.wbtc
    .connect(this.signers.admin)
    .approve(this.contracts.nonfungiblePositionManager.address, amount0Desired.toString());

  await this.contracts.usdc
    .connect(this.signers.admin)
    .approve(this.contracts.nonfungiblePositionManager.address, amount1Desired.toString());

  const params: {
    token0: string;
    token1: string;
    fee: number;
    tickLower: number;
    tickUpper: number;
    amount0Desired: string;
    amount1Desired: string;
    amount0Min: BigNumber;
    amount1Min: BigNumber;
    recipient: string;
    deadline: number;
  } = {
    token0: this.contracts.wbtc.address,
    token1: this.contracts.usdc.address,
    fee: poolData.fee,
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: Zero,
    amount1Min: Zero,
    recipient: this.signers.admin.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  await this.contracts.nonfungiblePositionManager.connect(this.signers.admin).mint(params, { gasLimit: "1000000" });
}

export async function decreaseUniswapV3PoolReserves(this: Mocha.Context, decreaseLiquidity: string): Promise<void> {
  const params: {
    tokenId: string;
    liquidity: string;
    amount0Min: string;
    amount1Min: string;
    deadline: number;
  } = {
    tokenId: "1",
    liquidity: decreaseLiquidity,
    amount0Min: "0",
    amount1Min: "1000",
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  await this.contracts.nonfungiblePositionManager
    .connect(this.signers.admin)
    .decreaseLiquidity(params, { gasLimit: "1000000" });

  const CollectParams: {
    tokenId: string;
    recipient: string;
    amount0Max: string;
    amount1Max: string;
  } = {
    tokenId: "1",
    recipient: this.signers.admin.address,
    amount0Max: Number.MAX_SAFE_INTEGER.toString(),
    amount1Max: Number.MAX_SAFE_INTEGER.toString(),
  };
  await this.contracts.nonfungiblePositionManager.connect(this.signers.admin).collect(CollectParams);
}

export async function increaseUniswapV3PoolReserves(this: Mocha.Context, increaseLiquidity: string): Promise<void> {
  const poolData = await getPoolData(this.contracts.uniswapV3Pool);
  const WbtcToken = new Token(31337, this.contracts.wbtc.address, 8, "WBTC", "WrappedBitcoin");
  const UsdcToken = new Token(31337, this.contracts.usdc.address, 6, "USDC", "UsdCoin");
  const pool = new Pool(
    WbtcToken,
    UsdcToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick,
  );

  const position = new Position({
    pool: pool,
    liquidity: increaseLiquidity, //"120000000000000",
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
  });

  const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

  // Mint WBTC to the admin address.
  await this.contracts.wbtc.__godMode_mint(this.signers.admin.address, amount0Desired.toString());

  // Mint USDC to the admin address.
  await this.contracts.usdc.__godMode_mint(this.signers.admin.address, amount1Desired.toString());

  await this.contracts.wbtc
    .connect(this.signers.admin)
    .approve(this.contracts.nonfungiblePositionManager.address, amount0Desired.toString());

  await this.contracts.usdc
    .connect(this.signers.admin)
    .approve(this.contracts.nonfungiblePositionManager.address, amount1Desired.toString());
  const params: {
    tokenId: string;
    amount0Desired: string;
    amount1Desired: string;
    amount0Min: string;
    amount1Min: string;
    deadline: number;
  } = {
    tokenId: "1",
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: "0",
    amount1Min: "0",
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  await this.contracts.nonfungiblePositionManager
    .connect(this.signers.admin)
    .increaseLiquidity(params, { gasLimit: "1000000" });

  const CollectParams: {
    tokenId: string;
    recipient: string;
    amount0Max: string;
    amount1Max: string;
  } = {
    tokenId: "1",
    recipient: this.signers.admin.address,
    amount0Max: Number.MAX_SAFE_INTEGER.toString(),
    amount1Max: Number.MAX_SAFE_INTEGER.toString(),
  };
  await this.contracts.nonfungiblePositionManager.connect(this.signers.admin).collect(CollectParams);
}
