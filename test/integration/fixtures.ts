import { Signer } from "@ethersproject/abstract-signer";

import { ChainlinkOperator } from "../../typechain/ChainlinkOperator";
import { DummyPriceFeed } from "../../typechain";
import { Erc20Mintable } from "../../typechain/Erc20Mintable";
import { Fintroller } from "../../typechain/Fintroller";
import { GodModeBalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeFyToken } from "../../typechain/GodModeFyToken";
import { GodModeRedemptionPool } from "../../typechain/GodModeRedemptionPool";
import {
  deployChainlinkOperator,
  deployCollateral,
  deployCollateralUsdFeed,
  deployFintroller,
  deployGodModeBalanceSheet,
  deployGodModeFyToken,
  deployGodModeRedemptionPool,
  deployUnderlying,
  deployUnderlyingUsdFeed,
} from "../deployers";
import { fyTokenConstants } from "../../helpers/constants";

type IntegrationFixtureReturnType = {
  balanceSheet: GodModeBalanceSheet;
  collateral: Erc20Mintable;
  collateralUsdFeed: DummyPriceFeed;
  fintroller: Fintroller;
  fyToken: GodModeFyToken;
  oracle: ChainlinkOperator;
  redemptionPool: GodModeRedemptionPool;
  underlying: Erc20Mintable;
  underlyingUsdFeed: DummyPriceFeed;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const collateral: Erc20Mintable = await deployCollateral(deployer);
  const underlying: Erc20Mintable = await deployUnderlying(deployer);

  const collateralUsdFeed: DummyPriceFeed = await deployCollateralUsdFeed(deployer);
  const underlyingUsdFeed: DummyPriceFeed = await deployUnderlyingUsdFeed(deployer);
  const oracle: ChainlinkOperator = await deployChainlinkOperator(
    deployer,
    collateral,
    collateralUsdFeed,
    underlying,
    underlyingUsdFeed,
  );

  const fintroller: Fintroller = await deployFintroller(deployer);
  await fintroller.connect(deployer).setOracle(oracle.address);

  const balanceSheet: GodModeBalanceSheet = await deployGodModeBalanceSheet(deployer, fintroller.address);

  /* Override the RedemptionPool.sol contract created by the fyToken with GodModeRedemptionPool.sol */
  const fyToken: GodModeFyToken = await deployGodModeFyToken(
    deployer,
    fyTokenConstants.expirationTime,
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
    collateralUsdFeed,
    fintroller,
    fyToken,
    oracle,
    redemptionPool,
    underlying,
    underlyingUsdFeed,
  };
}
