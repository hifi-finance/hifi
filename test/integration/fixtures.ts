import { Signer } from "@ethersproject/abstract-signer";

import { Erc20Mintable } from "../../typechain/Erc20Mintable";
import { Fintroller } from "../../typechain/Fintroller";
import { GodModeBalanceSheet as BalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeFyToken as FyToken } from "../../typechain/GodModeFyToken";
import { GodModeRedemptionPool as RedemptionPool } from "../../typechain/GodModeRedemptionPool";
import { SimpleUniswapAnchoredView } from "../../typechain/SimpleUniswapAnchoredView";
import {
  deployBalanceSheet,
  deployCollateral,
  deployFintroller,
  deployUnderlying,
  deployOracle,
  deployRedemptionPool,
  deployFyToken,
} from "../../helpers/deployers";

type IntegrationFixtureReturnType = {
  balanceSheet: BalanceSheet;
  collateral: Erc20Mintable;
  fintroller: Fintroller;
  fyToken: FyToken;
  oracle: SimpleUniswapAnchoredView;
  redemptionPool: RedemptionPool;
  underlying: Erc20Mintable;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const oracle: SimpleUniswapAnchoredView = await deployOracle(deployer);
  const fintroller: Fintroller = await deployFintroller(deployer);
  await fintroller.connect(deployer).setOracle(oracle.address);

  const balanceSheet: BalanceSheet = await deployBalanceSheet(deployer, fintroller);
  const collateral: Erc20Mintable = await deployCollateral(deployer);
  const underlying: Erc20Mintable = await deployUnderlying(deployer);

  /* Override the RedemptionPool.sol contract created by the fyToken with GodModeRedemptionPool.sol */
  const fyToken: FyToken = await deployFyToken(deployer, fintroller, balanceSheet, underlying, collateral);
  const redemptionPool: RedemptionPool = await deployRedemptionPool(deployer, fintroller, fyToken);
  await fyToken.__godMode__setRedemptionPool(redemptionPool.address);

  return { balanceSheet, collateral, fintroller, fyToken, oracle, redemptionPool, underlying };
}
