import { BigNumber } from "@ethersproject/bignumber";

export interface Bond {
  collateralizationRatio: BigNumber;
}

export interface Scenario {
  collateral: {
    decimals: BigNumber;
    name: string;
    symbol: string;
  };
  fintroller: {
    collateralizationRatio: BigNumber;
  };
  guarantorPool: {
    decimals: BigNumber;
    name: string;
    symbol: string;
  };
  underlying: {
    decimals: BigNumber;
    name: string;
    symbol: string;
  };
  yToken: {
    decimals: BigNumber;
    expirationTime: BigNumber;
    name: string;
    symbol: string;
  };
}
