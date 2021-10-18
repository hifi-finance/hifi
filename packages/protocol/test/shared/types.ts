import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { MockContract } from "ethereum-waffle";
import { Fixture } from "ethereum-waffle";

import { ChainlinkOperator } from "../../src/types/ChainlinkOperator";
import { FintrollerV1 } from "../../src/types/FintrollerV1";
import { GodModeBalanceSheet } from "../../src/types/GodModeBalanceSheet";
import { GodModeErc20 } from "../../src/types/GodModeErc20";
import { GodModeHToken } from "../../src/types/GodModeHToken";
import { OwnableUpgradeable } from "../../src/types/OwnableUpgradeable";
import { SimplePriceFeed } from "../../src/types/SimplePriceFeed";
import { StablecoinPriceFeed } from "../../src/types/StablecoinPriceFeed";

declare module "mocha" {
  interface Context {
    contracts: Contracts;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    mocks: Mocks;
    signers: Signers;
  }
}

export interface Contracts {
  balanceSheet: GodModeBalanceSheet;
  fintroller: FintrollerV1;
  hTokens: GodModeHToken[];
  oracle: ChainlinkOperator;
  ownableUpgradeable: OwnableUpgradeable;
  usdc: GodModeErc20;
  usdcPriceFeed: StablecoinPriceFeed;
  wbtc: GodModeErc20;
  wbtcPriceFeed: SimplePriceFeed;
}

export interface Mocks {
  balanceSheet: MockContract;
  fintroller: MockContract;
  hTokens: MockContract[];
  oracle: MockContract;
  usdc: MockContract;
  usdcPriceFeed: MockContract;
  wbtc: MockContract;
  wbtcPriceFeed: MockContract;
  weth: MockContract;
  wethPriceFeed: MockContract;
}

export interface Signers {
  admin: SignerWithAddress;
  borrower: SignerWithAddress;
  lender: SignerWithAddress;
  liquidator: SignerWithAddress;
  maker: SignerWithAddress;
  raider: SignerWithAddress;
}
