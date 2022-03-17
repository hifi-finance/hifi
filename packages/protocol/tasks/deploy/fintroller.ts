import type { Fintroller } from "@hifi/protocol/dist/types/Fintroller";
import { Fintroller__factory } from "@hifi/protocol/dist/types/factories/Fintroller__factory";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_FINTROLLER } from "../constants";

task(TASK_DEPLOY_CONTRACT_FINTROLLER)
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("print", "Print the address in the console", true, types.boolean)
  .addOptionalParam("verify", "Verify the contract on Etherscan", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const fintrollerFactory: Fintroller__factory = new Fintroller__factory(signers[0]);
    const fintroller: Fintroller = <Fintroller>await fintrollerFactory.deploy();

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: fintroller,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.print) {
      console.table([{ name: "Fintroller", address: fintroller.address }]);
    }

    if (taskArgs.verify) {
      try {
        await run("verify:verify", {
          address: fintroller.address,
          constructorArguments: [],
        });
      } catch (error) {
        console.error("Error while verifying contract:", error);
      }
    }

    return fintroller.address;
  });
