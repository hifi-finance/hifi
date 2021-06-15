import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { MockContract } from "ethereum-waffle";

import { ChainlinkOperator } from "../typechain/ChainlinkOperator";
import { Erc20Mintable } from "../typechain/Erc20Mintable";
import { FintrollerV1 } from "../typechain/FintrollerV1";
import { GodModeBalanceSheet } from "../typechain/GodModeBalanceSheet";
import { GodModeHToken } from "../typechain/GodModeHToken";
import { SimplePriceFeed } from "../typechain/SimplePriceFeed";
import { StablecoinPriceFeed } from "../typechain/StablecoinPriceFeed";

export interface Contracts {
  balanceSheet: GodModeBalanceSheet;
  fintroller: FintrollerV1;
  hTokens: GodModeHToken[];
  oracle: ChainlinkOperator;
  usdc: Erc20Mintable;
  usdcPriceFeed: StablecoinPriceFeed;
  wbtc: Erc20Mintable;
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
  owner: SignerWithAddress;
  borrower: SignerWithAddress;
  lender: SignerWithAddress;
  liquidator: SignerWithAddress;
  maker: SignerWithAddress;
  raider: SignerWithAddress;
}
