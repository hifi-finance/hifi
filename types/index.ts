import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { MockContract } from "ethereum-waffle";

import { ChainlinkOperator } from "../typechain/ChainlinkOperator";
import { FintrollerV1 } from "../typechain/FintrollerV1";
import { GodModeBalanceSheet } from "../typechain/GodModeBalanceSheet";
import { GodModeErc20 } from "../typechain/GodModeErc20";
import { GodModeHToken } from "../typechain/GodModeHToken";
import { OwnableUpgradeable } from "../typechain/OwnableUpgradeable";
import { SimplePriceFeed } from "../typechain/SimplePriceFeed";
import { StablecoinPriceFeed } from "../typechain/StablecoinPriceFeed";

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
