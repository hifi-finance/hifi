import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import fp from "evm-fp";

import {
  DEFAULT_LIQUIDATION_INCENTIVE,
  NORMALIZED_USDC_PRICE,
  NORMALIZED_WBTC_PRICE,
  NORMALIZED_WETH_PRICE,
  WBTC_COLLATERALIZATION_RATIO,
  WBTC_PRECISION_SCALAR,
  WETH_COLLATERALIZATION_RATIO,
} from "../../helpers/constants";
import { precisionScalarForDecimals } from "../../helpers/numbers";

const SCALE = fp("1");
const HALF_SCALE = fp("0.5");

export function prbDiv(x: BigNumber, y: BigNumber): BigNumber {
  return x.mul(SCALE).div(y);
}

export function prbMul(x: BigNumber, y: BigNumber): BigNumber {
  const doubleScaledProduct = x.mul(y);
  let doubleScaledProductWithHalfScale: BigNumber;
  if (doubleScaledProduct.isNegative()) {
    doubleScaledProductWithHalfScale = doubleScaledProduct.sub(HALF_SCALE);
  } else {
    doubleScaledProductWithHalfScale = doubleScaledProduct.add(HALF_SCALE);
  }
  const result: BigNumber = doubleScaledProductWithHalfScale.div(SCALE);
  return result;
}

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

export function getSeizableCollateralAmount(
  repayAmount: BigNumber,
  wbtcPrice: BigNumber,
  collateralDecimals: BigNumber = BigNumber.from(8),
  liquidationIncentive: BigNumber = DEFAULT_LIQUIDATION_INCENTIVE,
): BigNumber {
  const numerator: BigNumber = prbMul(prbMul(repayAmount, liquidationIncentive), NORMALIZED_USDC_PRICE);
  const normalizedSeizableCollateralAmount: BigNumber = prbDiv(numerator, wbtcPrice);
  const precisionScalar: BigNumber = precisionScalarForDecimals(collateralDecimals);
  const seizableCollateralAmount: BigNumber = normalizedSeizableCollateralAmount.div(precisionScalar);
  return seizableCollateralAmount;
}

export function weighWbtc(
  wbtcAmount: BigNumber,
  collateralizationRatio: BigNumber = WBTC_COLLATERALIZATION_RATIO,
): BigNumber {
  const normalizedWbtcAmount: BigNumber = wbtcAmount.mul(WBTC_PRECISION_SCALAR);
  return prbDiv(prbMul(normalizedWbtcAmount, NORMALIZED_WBTC_PRICE), collateralizationRatio);
}

export function weighWeth(
  wethAmount: BigNumber,
  collateralizationRatio: BigNumber = WETH_COLLATERALIZATION_RATIO,
): BigNumber {
  return prbDiv(prbMul(wethAmount, NORMALIZED_WETH_PRICE), collateralizationRatio);
}
