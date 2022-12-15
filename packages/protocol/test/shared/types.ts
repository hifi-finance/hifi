import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { MockContract } from "ethereum-waffle";
import type { Fixture } from "ethereum-waffle";

import type { ChainlinkOperator } from "../../src/types/contracts/oracles/ChainlinkOperator";
import type { SimplePriceFeed } from "../../src/types/contracts/oracles/SimplePriceFeed";
import type { GodModeBalanceSheet } from "../../src/types/contracts/test/GodModeBalanceSheet";
import type { GodModeErc20 } from "../../src/types/contracts/test/GodModeErc20";
import type { GodModeFintroller } from "../../src/types/contracts/test/GodModeFintroller";
import type { GodModeHToken } from "../../src/types/contracts/test/GodModeHToken";
import type { GodModeOwnableUpgradeable } from "../../src/types/contracts/test/GodModeOwnableUpgradeable";

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
  fintroller: GodModeFintroller;
  hTokens: GodModeHToken[];
  oracle: ChainlinkOperator;
  ownableUpgradeable: GodModeOwnableUpgradeable;
  usdc: GodModeErc20;
  usdcPriceFeed: SimplePriceFeed;
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
