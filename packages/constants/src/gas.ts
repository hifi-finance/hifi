import { BigNumber } from "@ethersproject/bignumber";

export const GAS_LIMITS = {
  coverage: BigNumber.from(500_000_000),
  hardhat: BigNumber.from(100_000_000),
};
