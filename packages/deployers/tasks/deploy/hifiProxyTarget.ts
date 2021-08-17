import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HifiProxyTarget } from "@hifi/proxy-target/typechain/HifiProxyTarget";
import { HifiProxyTarget__factory } from "@hifi/proxy-target/typechain/factories/HifiProxyTarget__factory";
import { task } from "hardhat/config";
import { TASK_DEPLOY_HIFI_PROXY_TARGET } from "../constants";

task(TASK_DEPLOY_HIFI_PROXY_TARGET).setAction(async function (_, { ethers }): Promise<string> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const hifiProxyTargetFactory: HifiProxyTarget__factory = new HifiProxyTarget__factory(signers[0]);
  const hifiProxyTarget: HifiProxyTarget = <HifiProxyTarget>await hifiProxyTargetFactory.deploy();
  await hifiProxyTarget.deployed();
  return hifiProxyTarget.address;
});
