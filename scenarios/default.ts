import { BigNumber } from "@ethersproject/bignumber";

import { OnePercent } from "../dev-utils/constants";
import { Scenario } from "../@types";

const defaultScenario: Scenario = {
  collateral: {
    decimals: BigNumber.from(18),
    name: "Wrapped Ether",
    symbol: "WETH",
  },
  fintroller: {
    collateralizationRatio: BigNumber.from(150).mul(OnePercent),
  },
  guarantorPool: {
    decimals: BigNumber.from(18),
    name: "Mainframe Guarantor Pool Shares",
    symbol: "MGP-SHARES",
  },
  underlying: {
    decimals: BigNumber.from(18),
    name: "Dai Stablecoin",
    symbol: "DAI",
  },
  yToken: {
    decimals: BigNumber.from(18),
    expirationTime: BigNumber.from(1609459199), // December 31, 2020 at 23:59:59
    name: "DAI/ETH (2021-01-01)",
    symbol: "yDAI-JAN21",
  },
};

export default defaultScenario;
