import * as core from "@actions/core";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HifiProxyTarget } from "@hifi/proxy-target/typechain/HifiProxyTarget";
import { HifiProxyTarget__factory } from "@hifi/proxy-target/typechain/factories/HifiProxyTarget__factory";
import { task, types } from "hardhat/config";
import { TASK_DEPLOY_HIFI_PROXY_TARGET } from "../constants";
import { TaskArguments } from "hardhat/types";

task(TASK_DEPLOY_HIFI_PROXY_TARGET)
  .addOptionalParam("printAddress", "Whether to print the address in the console", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hifiProxyTargetFactory: HifiProxyTarget__factory = new HifiProxyTarget__factory(signers[0]);
    const hifiProxyTarget: HifiProxyTarget = <HifiProxyTarget>await hifiProxyTargetFactory.deploy();
    await hifiProxyTarget.deployed();
    if (taskArgs.printAddress) {
      core.setOutput("hifi-proxy-target", hifiProxyTarget.address);
      console.table([{ name: "HifiProxyTarget", address: hifiProxyTarget.address }]);
    }
    return hifiProxyTarget.address;
  });
