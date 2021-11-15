import type { BigNumber } from "@ethersproject/bignumber";

export async function getSeizeAndRepayAndProfitAmounts(
  this: Mocha.Context,
  collateral: string,
  repayHTokenAmount: BigNumber,
  swapUnderlyingAmount: BigNumber,
): Promise<{
  expectedProfitAmount: BigNumber;
  repayAmount: BigNumber;
  seizeAmount: BigNumber;
}> {
  const seizeAmount = await this.contracts.balanceSheet.getSeizableCollateralAmount(
    this.contracts.hToken.address,
    repayHTokenAmount,
    this.contracts.wbtc.address,
  );
  const repayAmount = await this.contracts.flashUniswapV2.getRepayAmount(
    this.contracts.uniswapV2Pair.address,
    collateral,
    this.contracts.usdc.address,
    swapUnderlyingAmount,
  );
  const expectedProfitAmount = seizeAmount.sub(repayAmount);
  return { expectedProfitAmount, repayAmount, seizeAmount };
}

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
  // Mint WBTC to the pair contract.
  if (!wbtcAmount.isZero()) {
    await this.contracts.wbtc.__godMode_burn(this.contracts.uniswapV2Pair.address, wbtcAmount);
  }

  // Mint USDC to the pair contract.
  if (!usdcAmount.isZero()) {
    await this.contracts.usdc.__godMode_burn(this.contracts.uniswapV2Pair.address, usdcAmount);
  }

  // Sync the token reserves in the UniswapV2Pair contract.
  await this.contracts.uniswapV2Pair.sync();
}
