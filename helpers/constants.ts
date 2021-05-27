import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { TransactionRequest } from "@ethersproject/providers";
import fp from "evm-fp";

import { bn } from "./numbers";
import { daysInSeconds, now } from "./time";

// Ethereum constants.
export const ADDRESS_ONE: string = "0x0000000000000000000000000000000000000001";
export const MAX_INT256: BigNumber = bn(
  "57896044618658097711785492504343953926634992332820282019728792003956564819967",
);

// Generic amounts.
export const tenMillion: BigNumber = bn("1e7");
export const fiftyMillion: BigNumber = bn("5e8");

// Decimals.
export const defaultNumberOfDecimals: BigNumber = bn("18");
export const chainlinkPricePrecision: BigNumber = bn("8");
export const chainlinkPricePrecisionScalar: BigNumber = bn("10");

// Ten raised to the difference between 18 and the token's decimals.
export const precisionScalars = {
  tokenWith6Decimals: bn("1e12"),
  tokenWith8Decimals: bn("1e10"),
  tokenWith18Decimals: bn("1"),
};

// Gas limits, needed lest deployments fail on coverage.
export const gasLimits = {
  hardhat: {
    blockGasLimit: bn("1e8"),
    callGasLimit: bn("1e8"),
    deployContractGasLimit: bn("1e8"),
  },
  coverage: {
    blockGasLimit: bn("5e8"),
    callGasLimit: bn("5e8"),
    deployContractGasLimit: bn("5e8"),
  },
};

// Contract-specific constants
export const balanceSheetConstants = {
  defaultVault: {
    debt: Zero,
    freeCollateral: Zero,
    lockedCollateral: Zero,
    isOpen: true,
  },
};

export const deployContractOverrides: TransactionRequest = {
  gasLimit: process.env.CODE_COVERAGE
    ? gasLimits.coverage.deployContractGasLimit
    : gasLimits.hardhat.deployContractGasLimit,
};

export const fintrollerConstants = {
  collateralizationRatioLowerBound: fp("1.00"),
  collateralizationRatioUpperBound: fp("100.00"),
  defaultCollateralizationRatio: fp("1.50"),
  defaultLiquidationIncentive: fp("1.10"),
  liquidationIncentiveLowerBound: fp("1.00"),
  liquidationIncentiveUpperBound: fp("1.50"),
  oraclePrecisionScalar: chainlinkPricePrecisionScalar,
};

// TODO: make the name and symbol match the expiration time
export const hTokenConstants = {
  decimals: defaultNumberOfDecimals,
  expirationTime: now().add(daysInSeconds(90)),
  name: "hfyUSDC (2022-01-01)",
  symbol: "hfyUSDC-JAN22",
};

export const underlyingConstants = {
  decimals: 6,
  name: "USD Coin",
  symbol: "USDC",
};
