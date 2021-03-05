import { BigNumber } from "@ethersproject/bignumber";
import { One, Zero } from "@ethersproject/constants";

import { getDaysInSeconds, getNow } from "./time";

// Ethereum constants.
export const addressOne: string = "0x0000000000000000000000000000000000000001";
export const maxInt256: BigNumber = BigNumber.from(
  "57896044618658097711785492504343953926634992332820282019728792003956564819967",
);

// Generic amounts.
export const ten: BigNumber = BigNumber.from(10);
export const tenMillion: BigNumber = ten.pow(7);
export const fiftyMillion: BigNumber = tenMillion.mul(50);

// Decimals.
export const defaultNumberOfDecimals: BigNumber = BigNumber.from(18);
export const chainlinkPricePrecision: BigNumber = BigNumber.from(8);
export const chainlinkPricePrecisionScalar: BigNumber = ten.pow(defaultNumberOfDecimals.sub(chainlinkPricePrecision));

// Percentages as mantissas (decimal scalars with 18 decimals).
export const percentages: { [name: string]: BigNumber } = {
  oneHundred: ten.pow(18),
  oneHundredAndTen: ten.pow(18).add(ten.pow(17)),
  oneHundredAndTwenty: ten.pow(18).add(ten.pow(17).mul(2)),
  oneHundredAndFifty: ten.pow(18).add(ten.pow(17).mul(5)),
  oneHundredAndSeventyFive: ten.pow(16).mul(175),
  oneThousand: ten.pow(19),
  tenThousand: ten.pow(20),
};

// Ten raised to the difference between 18 and the token's decimals.
export const precisionScalars = {
  tokenWith6Decimals: ten.pow(12),
  tokenWith8Decimals: ten.pow(10),
  tokenWith18Decimals: One,
};

// Prices with 8 decimals, as per Chainlink format.
export const prices: { [name: string]: BigNumber } = {
  oneDollar: ten.pow(chainlinkPricePrecision),
  twelveDollars: ten.pow(chainlinkPricePrecision).mul(12),
  oneHundredDollars: ten.pow(chainlinkPricePrecision).mul(100),
};

// These amounts assume that the token has 18 decimals.
export const tokenAmounts: { [name: string]: BigNumber } = {
  pointFiftyFive: ten.pow(17).mul(5).add(ten.pow(16).mul(5)),
  one: ten.pow(18),
  two: ten.pow(18).mul(2),
  ten: ten.pow(19),
  forty: ten.pow(19).mul(4),
  fifty: ten.pow(19).mul(5),
  oneHundred: ten.pow(20),
  oneThousand: ten.pow(21),
  tenThousand: ten.pow(22),
  oneHundredThousand: ten.pow(23),
  oneMillion: ten.pow(24),
};

// Chain ids.
export const chainIds = {
  hardhat: 31337,
  goerli: 5,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

// Gas limits, needed lest deployments fail on coverage.
export const gasLimits = {
  hardhat: {
    blockGasLimit: tenMillion,
    callGasLimit: tenMillion,
    deployContractGasLimit: tenMillion,
  },
  coverage: {
    blockGasLimit: fiftyMillion,
    callGasLimit: fiftyMillion,
    deployContractGasLimit: fiftyMillion,
  },
};

// Private keys.
export const defaultPrivateKeys = {
  admin: "0x907eb204083c9b1c24fdfc26bb120a8713fcc3323edf1b8423a2ad58d0fbaeb8",
  borrower: "0xd0792a518700b34f3cf29d533f1d8bb81262eabca4f1817212a5044ee866c3a6",
  lender: "0xc0152f90ad35f85568c66192307be596aaa3431cb23dda6d99e7393b959b0930",
  liquidator: "0x2630b870626d4f8d344cb7a3eb9f775a66b19a8a00779a30bb401739a4c9ec6b",
  maker: "0x6a9bff3d641bc1311f1f67d58440c76acaa81a273d287aeb6af96950ad59df65",
  raider: "0x638b667580ca2334d72ed39f20c802b7a07cd0614a9a43c64f91d8058cfe884b",
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

export const fintrollerConstants = {
  collateralizationRatioLowerBoundMantissa: percentages.oneHundred,
  collateralizationRatioUpperBoundMantissa: percentages.tenThousand,
  defaultCollateralizationRatio: percentages.oneHundredAndFifty,
  liquidationIncentiveLowerBoundMantissa: percentages.oneHundred,
  liquidationIncentiveUpperBoundMantissa: percentages.oneHundredAndFifty,
  oraclePrecisionScalar: chainlinkPricePrecisionScalar,
};

// TODO: make the name and symbol match the expiration time
export const fyTokenConstants = {
  decimals: defaultNumberOfDecimals,
  expirationTime: getNow().add(getDaysInSeconds(90)),
  name: "hfyUSDC (2022-01-01)",
  symbol: "hfyUSDC-JAN22",
};

export const underlyingConstants = {
  decimals: 6,
  name: "USD Coin",
  symbol: "USDC",
};
