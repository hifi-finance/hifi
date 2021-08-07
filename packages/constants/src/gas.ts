import { BigNumber } from "@ethersproject/bignumber";
import fromExponential from "from-exponential";

export const GAS_LIMITS = {
  coverage: BigNumber.from(fromExponential("5e8")),
  hardhat: BigNumber.from(fromExponential("1e8")),
};
