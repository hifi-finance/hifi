import * as core from "@actions/core";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HifiProxyTarget } from "@hifi/proxy-target/typechain/HifiProxyTarget";
import { HifiProxyTarget__factory } from "@hifi/proxy-target/typechain/factories/HifiProxyTarget__factory";
import { task, types } from "hardhat/config";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_HIFI_PROXY_TARGET } from "../constants";
import { TaskArguments } from "hardhat/types";

task(TASK_DEPLOY_CONTRACT_HIFI_PROXY_TARGET)
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hifiProxyTargetFactory: HifiProxyTarget__factory = new HifiProxyTarget__factory(signers[0]);
    const hifiProxyTarget: HifiProxyTarget = <HifiProxyTarget>await hifiProxyTargetFactory.deploy();

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: hifiProxyTarget,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.setOutput) {
      core.setOutput("hifi-proxy-target", hifiProxyTarget.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "HifiProxyTarget", address: hifiProxyTarget.address }]);
    }

    return hifiProxyTarget.address;
  });
