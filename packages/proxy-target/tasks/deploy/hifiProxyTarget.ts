import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HifiProxyTarget } from "@hifi/proxy-target/dist/types/HifiProxyTarget";
import { HifiProxyTarget__factory } from "@hifi/proxy-target/dist/types/factories/HifiProxyTarget__factory";
import { task, types } from "hardhat/config";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_HIFI_PROXY_TARGET } from "../constants";
import { TaskArguments } from "hardhat/types";

task(TASK_DEPLOY_CONTRACT_HIFI_PROXY_TARGET)
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("print", "Print the address in the console", true, types.boolean)
  .addOptionalParam("verify", "Verify the contract on Etherscan", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hifiProxyTargetFactory: HifiProxyTarget__factory = new HifiProxyTarget__factory(signers[0]);
    const hifiProxyTarget: HifiProxyTarget = <HifiProxyTarget>await hifiProxyTargetFactory.deploy();

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: hifiProxyTarget,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.print) {
      console.table([{ name: "HifiProxyTarget", address: hifiProxyTarget.address }]);
    }

    if (taskArgs.verify) {
      try {
        await run("verify:verify", {
          address: hifiProxyTarget.address,
          constructorArguments: [],
        });
      } catch (error) {
        console.error("Error while verifying contract:", error);
      }
    }

    return hifiProxyTarget.address;
  });
