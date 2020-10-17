import { Signer } from "@ethersproject/abstract-signer";
import { ethers } from "@nomiclabs/buidler";

import RedemptionPoolArtifact from "../../artifacts/GodModeRedemptionPool.json";

import { Erc20Mintable } from "../../typechain/Erc20Mintable";
import { Fintroller } from "../../typechain/Fintroller";
import { GodModeBalanceSheet as BalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeRedemptionPool as RedemptionPool } from "../../typechain/GodModeRedemptionPool";
import { GodModeYToken as YToken } from "../../typechain/GodModeYToken";
import { SimpleUniswapAnchoredView } from "../../typechain/SimpleUniswapAnchoredView";
import {
  deployBalanceSheet,
  deployCollateral,
  deployFintroller,
  deployUnderlying,
  deployOracle,
  deployYToken,
} from "../../helpers/deployers";

type IntegrationFixtureReturnType = {
  balanceSheet: BalanceSheet;
  collateral: Erc20Mintable;
  fintroller: Fintroller;
  oracle: SimpleUniswapAnchoredView;
  redemptionPool: RedemptionPool;
  underlying: Erc20Mintable;
  yToken: YToken;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const oracle: SimpleUniswapAnchoredView = await deployOracle(deployer);
  const fintroller: Fintroller = await deployFintroller(deployer);
  await fintroller.connect(deployer).setOracle(oracle.address);

  const balanceSheet: BalanceSheet = await deployBalanceSheet(deployer, fintroller);
  const collateral: Erc20Mintable = await deployCollateral(deployer);
  const underlying: Erc20Mintable = await deployUnderlying(deployer);

  const yToken: YToken = await deployYToken(deployer, fintroller, balanceSheet, underlying, collateral);
  const redemptionPoolAddress: string = await yToken.redemptionPool();
  const redemptionPool: RedemptionPool = new ethers.Contract(
    redemptionPoolAddress,
    RedemptionPoolArtifact.abi,
    ethers.provider,
  ) as RedemptionPool;

  return { balanceSheet, collateral, fintroller, oracle, redemptionPool, underlying, yToken };
}
