import { Signer } from "@ethersproject/abstract-signer";

import { Erc20Mintable } from "../../typechain/Erc20Mintable";
import { Fintroller } from "../../typechain/Fintroller";
import { GodModeBalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeFyToken } from "../../typechain/GodModeFyToken";
import { GodModeRedemptionPool } from "../../typechain/GodModeRedemptionPool";
import { SimpleUniswapAnchoredView } from "../../typechain/SimpleUniswapAnchoredView";
import {
  deployCollateral,
  deployFintroller,
  deployGodModeBalanceSheet,
  deployGodModeFyToken,
  deployGodModeRedemptionPool,
  deploySimpleUniswapAnchoredView,
  deployUnderlying,
} from "../deployers";

type IntegrationFixtureReturnType = {
  balanceSheet: GodModeBalanceSheet;
  collateral: Erc20Mintable;
  fintroller: Fintroller;
  fyToken: GodModeFyToken;
  oracle: SimpleUniswapAnchoredView;
  redemptionPool: GodModeRedemptionPool;
  underlying: Erc20Mintable;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const oracle: SimpleUniswapAnchoredView = await deploySimpleUniswapAnchoredView(deployer);
  const fintroller: Fintroller = await deployFintroller(deployer);
  await fintroller.connect(deployer).setOracle(oracle.address);

  const balanceSheet: GodModeBalanceSheet = await deployGodModeBalanceSheet(deployer, fintroller.address);
  const collateral: Erc20Mintable = await deployCollateral(deployer);
  const underlying: Erc20Mintable = await deployUnderlying(deployer);

  /* Override the RedemptionPool.sol contract created by the fyToken with GodModeRedemptionPool.sol */
  const fyToken: GodModeFyToken = await deployGodModeFyToken(
    deployer,
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    collateral.address,
  );
  const redemptionPool: GodModeRedemptionPool = await deployGodModeRedemptionPool(
    deployer,
    fintroller.address,
    fyToken.address,
  );
  await fyToken.__godMode__setRedemptionPool(redemptionPool.address);

  return {
    balanceSheet,
    collateral,
    fintroller,
    fyToken,
    oracle,
    redemptionPool,
    underlying,
  };
}
