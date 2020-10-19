import { Signer } from "@ethersproject/abstract-signer";

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
  deployRedemptionPool,
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

  /* Override the RedemptionPool.sol contract created by the yToken with GodModeRedemptionPool.sol */
  const yToken: YToken = await deployYToken(deployer, fintroller, balanceSheet, underlying, collateral);
  const redemptionPool: RedemptionPool = await deployRedemptionPool(deployer, fintroller, yToken);
  await yToken.__godMode__setRedemptionPool(redemptionPool.address);

  return { balanceSheet, collateral, fintroller, oracle, redemptionPool, underlying, yToken };
}
