export interface Scenario {
  collateral: {
    decimals: number,
    name: string,
    symbol: string,
  },
  guarantorPool: {
    decimals: number,
    name: string,
    symbol: string,
  },
  underlying: {
    decimals: number,
    name: string,
    symbol: string,
  },
  yToken: {
    decimals: number,
    expirationTime: number;
    name: string,
    symbol: string,
  }
}

const scenarioKeys = ["default"];
export type ScenarioKey = typeof scenarioKeys[number];

const scenarios: Record<ScenarioKey, Scenario> = {
  default: {
    collateral: {
      decimals: 18,
      name: "Wrapped Ether",
      symbol: "WETH"
    },
    guarantorPool: {
      decimals: 18,
      name: "Mainframe Guarantor Pool Shares",
      symbol: "MGP-SHARES"
    },
    underlying: {
      decimals: 18,
      name: "Dai Stablecoin",
      symbol: "DAI"
    },
    yToken: {
      decimals: 18,
      expirationTime: 1609459199, // December 31, 2020 at 23:59:59
      name: "DAI/ETH (2021-01-01)",
      symbol: "yDAI-JAN21"
    }
  },
};

export default scenarios;
