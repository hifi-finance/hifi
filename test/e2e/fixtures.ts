import { Signer } from "@ethersproject/abstract-signer";
import { ethers } from "@nomiclabs/buidler";

import DaiAbi from "./abis/Dai.json";
import RedemptionPoolArtifact from "../../artifacts/RedemptionPool.json";
import UniswapAnchoredViewAbi from "./abis/UniswapAnchoredView.json";
import Weth9Abi from "./abis/Weth9.json";
import scenarios from "..//scenarios";

import { Fintroller } from "../../typechain/Fintroller";
import { BalanceSheet } from "../../typechain/BalanceSheet";
import { Dai } from "../../@types/contracts/Dai";
import { FyToken } from "../../typechain/FyToken";
import { RedemptionPool } from "../../typechain/RedemptionPool";
import { UniswapAnchoredViewInterface } from "../../typechain/UniswapAnchoredViewInterface";
import { Weth9 } from "../../@types/contracts/Weth9";
import { deployBalanceSheet, deployFintroller, deployFyToken } from "../deployers";

type E2eFixtureReturnType = {
  balanceSheet: BalanceSheet;
  collateral: Weth9;
  fintroller: Fintroller;
  fyToken: FyToken;
  oracle: UniswapAnchoredViewInterface;
  redemptionPool: RedemptionPool;
  underlying: Dai;
};

/**
 * WARNING: this is supposed to be run against a Mainnet fork. Do not run it
 * against BuidlerEVM, or there be dragons.
 */
export async function e2eFixture(signers: Signer[]): Promise<E2eFixtureReturnType> {
  const deployer: Signer = signers[0];

  /* Load the external dependencies from mainnet. */
  const collateral: Weth9 = new ethers.Contract(
    scenarios.mainnet.collateral.address,
    Weth9Abi,
    ethers.provider,
  ) as Weth9;
  const underlying: Dai = new ethers.Contract(scenarios.mainnet.underlying.address, DaiAbi, ethers.provider) as Dai;
  const oracle: UniswapAnchoredViewInterface = new ethers.Contract(
    scenarios.mainnet.oracle.address,
    UniswapAnchoredViewAbi,
  ) as UniswapAnchoredViewInterface;

  /* But we deploy our contracts. */
  const fintroller: Fintroller = await deployFintroller(deployer);
  await fintroller.connect(deployer).setOracle(oracle.address);
  const balanceSheet: BalanceSheet = await deployBalanceSheet(deployer, fintroller.address);
  const fyToken: FyToken = await deployFyToken(
    deployer,
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    collateral.address,
  );

  /* The Redemption Pool is created by the FyToken, so we have to instantiate it. */
  const redemptionPoolAddress: string = await fyToken.redemptionPool();
  const redemptionPool: RedemptionPool = new ethers.Contract(
    redemptionPoolAddress,
    RedemptionPoolArtifact.abi,
    ethers.provider,
  ) as RedemptionPool;

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
