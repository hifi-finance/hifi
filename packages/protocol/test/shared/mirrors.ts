import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import {
  COLLATERAL_RATIOS,
  LIQUIDATION_INCENTIVES,
  NORMALIZED_USDC_PRICE,
  NORMALIZED_WBTC_PRICE,
  NORMALIZED_WETH_PRICE,
  Q192,
  WBTC_DECIMALS,
  WBTC_PRICE_PRECISION_SCALAR,
} from "@hifi/constants";
import { getPrecisionScalar } from "@hifi/helpers";
import { div, mul } from "@prb/math";
import { TickMath } from "@uniswap/v3-sdk";

export function getHypotheticalAccountLiquidity(
  collateralAmounts: BigNumber[],
  debtAmounts: BigNumber[],
): { excessLiquidity: BigNumber; shortfallLiquidity: BigNumber } {
  // Sum up the weighted collateral values in USD.
  let totalWeightedCollateralValueUsd: BigNumber = Zero;
  totalWeightedCollateralValueUsd = totalWeightedCollateralValueUsd.add(weighWbtc(collateralAmounts[0]));
  totalWeightedCollateralValueUsd = totalWeightedCollateralValueUsd.add(weighWeth(collateralAmounts[1]));

  // Sum up all debts. It is assumed that the underlying is USDC and its price is $1.
  let totalDebtValueUsd: BigNumber = Zero;
  for (const debtAmount of debtAmounts) {
    totalDebtValueUsd = totalDebtValueUsd.add(debtAmount);
  }

  // Excess liquidity when there is more weighted collateral than debt, and shortfall liquidity when there is less
  // weighted collateral than debt.
  if (totalWeightedCollateralValueUsd.gt(totalDebtValueUsd)) {
    return {
      excessLiquidity: totalWeightedCollateralValueUsd.sub(totalDebtValueUsd),
      shortfallLiquidity: Zero,
    };
  } else {
    return {
      excessLiquidity: Zero,
      shortfallLiquidity: totalDebtValueUsd.sub(totalWeightedCollateralValueUsd),
    };
  }
}

export function getRepayAmount(
  collateralAmount: BigNumber,
  wbtcPrice: BigNumber,
  collateralDecimals: BigNumber = WBTC_DECIMALS,
  liquidationIncentive: BigNumber = LIQUIDATION_INCENTIVES.default,
): BigNumber {
  const precisionScalar: BigNumber = getPrecisionScalar(collateralDecimals);
  const normalizedCollateralAmount: BigNumber = collateralAmount.mul(precisionScalar);
  const numerator: BigNumber = mul(normalizedCollateralAmount, wbtcPrice);
  const denominator: BigNumber = mul(liquidationIncentive, NORMALIZED_USDC_PRICE);
  const repayAmount: BigNumber = div(numerator, denominator);
  return repayAmount;
}

export function getSeizableCollateralAmount(
  repayAmount: BigNumber,
  wbtcPrice: BigNumber,
  collateralDecimals: BigNumber = WBTC_DECIMALS,
  liquidationIncentive: BigNumber = LIQUIDATION_INCENTIVES.default,
): BigNumber {
  const numerator: BigNumber = mul(mul(repayAmount, liquidationIncentive), NORMALIZED_USDC_PRICE);
  const normalizedSeizableCollateralAmount: BigNumber = div(numerator, wbtcPrice);
  const precisionScalar: BigNumber = getPrecisionScalar(collateralDecimals);
  const seizableCollateralAmount: BigNumber = normalizedSeizableCollateralAmount.div(precisionScalar);
  return seizableCollateralAmount;
}

export function weighWbtc(
  wbtcDepositAmount: BigNumber,
  collateralRatio: BigNumber = COLLATERAL_RATIOS.wbtc,
): BigNumber {
  const normalizedWbtcAmount: BigNumber = wbtcDepositAmount.mul(WBTC_PRICE_PRECISION_SCALAR);
  return div(mul(normalizedWbtcAmount, NORMALIZED_WBTC_PRICE), collateralRatio);
}

export function weighWeth(
  wethDepositAmount: BigNumber,
  collateralRatio: BigNumber = COLLATERAL_RATIOS.weth,
): BigNumber {
  return div(mul(wethDepositAmount, NORMALIZED_WETH_PRICE), collateralRatio);
}

export function calculateTick(tickCumulatives: number[], twapInterval: number): number {
  const tick = BigNumber.from(tickCumulatives[1])
    .sub(BigNumber.from(tickCumulatives[0]))
    .div(BigNumber.from(twapInterval))
    .toNumber();
  return tick;
}

export function tickToTokenPrices(tick: number, token0Decimals: number, token1Decimals: number): BigNumber[] {
  const sqrtPriceX96: BigNumber = BigNumber.from(TickMath.getSqrtRatioAtTick(tick).toString());
  const num: BigNumber = sqrtPriceX96.mul(sqrtPriceX96);
  const denom: BigNumber = Q192.div(BigNumber.from("10").pow(BigNumber.from(token0Decimals).add(8)));
  const base: BigNumber = num.div(denom);
  const price0: BigNumber = base.eq(0)
    ? BigNumber.from("10").pow(BigNumber.from(token1Decimals).add(16))
    : BigNumber.from("10").pow(BigNumber.from(token1Decimals).add(16)).div(base);
  const price1: BigNumber = base.div(BigNumber.from("10").pow(BigNumber.from(token1Decimals)));
  return [price0.eq(0) ? BigNumber.from("1") : price0, price1.eq(0) ? BigNumber.from("1") : price1];
}
