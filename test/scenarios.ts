import { BigNumber } from "@ethersproject/bignumber";

import { defaultNumberOfDecimals, prices } from "../helpers/constants";

const collateralCommon = {
  decimals: defaultNumberOfDecimals,
  name: "Wrapped Ether",
  symbol: "WETH",
};

const underlyingCommon = {
  decimals: defaultNumberOfDecimals,
  name: "Dai Stablecoin",
  symbol: "DAI",
};

const scenarios = {
  buidlerEvm: {
    collateral: collateralCommon,
    oracle: {
      prices: {
        collateral: prices.oneHundredDollars,
        underlying: prices.oneDollar,
      },
    },
    underlying: underlyingCommon,
  },
  mainnet: {
    collateral: {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      ...collateralCommon,
    },
    oracle: {
      address: "0x922018674c12a7F0D394ebEEf9B58F186CdE13c1",
      deploymentBlockNumber: BigNumber.from(10921522),
    },
    underlying: {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      ...underlyingCommon,
    },
  },
};

export default scenarios;
