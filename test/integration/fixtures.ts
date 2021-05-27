import { Signer } from "@ethersproject/abstract-signer";

import { hTokenConstants } from "../../helpers/constants";
import { ChainlinkOperator } from "../../typechain/ChainlinkOperator";
import { Erc20Mintable } from "../../typechain/Erc20Mintable";
import { Fintroller } from "../../typechain/Fintroller";
import { GodModeBalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeHToken } from "../../typechain/GodModeHToken";
import { GodModeRedemptionPool } from "../../typechain/GodModeRedemptionPool";
import { SimplePriceFeed } from "../../typechain/SimplePriceFeed";
import {
  deployChainlinkOperator,
  deployCollateral,
  deployCollateralPriceFeed,
  deployFintroller,
  deployGodModeBalanceSheet,
  deployGodModeHToken,
  deployGodModeRedemptionPool,
  deployUnderlying,
  deployUnderlyingPriceFeed,
} from "../deployers";

type IntegrationFixtureReturnType = {
  balanceSheet: GodModeBalanceSheet;
  collateral: Erc20Mintable;
  collateralPriceFeed: SimplePriceFeed;
  fintroller: Fintroller;
  hToken: GodModeHToken;
  oracle: ChainlinkOperator;
  redemptionPool: GodModeRedemptionPool;
  underlying: Erc20Mintable;
  underlyingPriceFeed: SimplePriceFeed;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const collateral: Erc20Mintable = await deployCollateral(deployer);
  const underlying: Erc20Mintable = await deployUnderlying(deployer);

  const collateralPriceFeed: SimplePriceFeed = await deployCollateralPriceFeed(deployer);
  const underlyingPriceFeed: SimplePriceFeed = await deployUnderlyingPriceFeed(deployer);
  const oracle: ChainlinkOperator = await deployChainlinkOperator(deployer);
  await oracle.setFeed(collateral.address, collateralPriceFeed.address);
  await oracle.setFeed(underlying.address, underlyingPriceFeed.address);

  const fintroller: Fintroller = await deployFintroller(deployer);
  await fintroller.connect(deployer).setOracle(oracle.address);

  const balanceSheet: GodModeBalanceSheet = await deployGodModeBalanceSheet(deployer, fintroller.address);

  const hToken: GodModeHToken = await deployGodModeHToken(
    deployer,
    hTokenConstants.expirationTime,
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    collateral.address,
  );

  // We have to override the RedemptionPool.sol contract created by the hToken with GodModeRedemptionPool.sol
  const redemptionPool: GodModeRedemptionPool = await deployGodModeRedemptionPool(
    deployer,
    fintroller.address,
    hToken.address,
  );
  await hToken.__godMode__setRedemptionPool(redemptionPool.address);

  return {
    balanceSheet,
    collateral,
    collateralPriceFeed,
    fintroller,
    hToken,
    oracle,
    redemptionPool,
    underlying,
    underlyingPriceFeed,
  };
}
