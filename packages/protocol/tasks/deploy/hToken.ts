import { setOutput } from "@actions/core";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { HToken } from "../../src/types/contracts/core/h-token/HToken";
import { HToken__factory } from "../../src/types/factories/contracts/core/h-token/HToken__factory";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_H_TOKEN } from "../constants";

task(TASK_DEPLOY_CONTRACT_H_TOKEN)
  // Contract arguments
  .addParam("name", "ERC-20 name of the hToken")
  .addParam("symbol", "ERC-20 symbol of the hToken")
  .addParam("maturity", "Unix timestamp for when the hToken matures")
  .addParam("balanceSheet", "Address of the BalanceSheet contract to connect to")
  .addParam("fintroller", "Address of the Fintroller contract to connect to")
  .addParam("underlying", "Address of the underlying ERC-20 contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("print", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .addOptionalParam("verify", "Verify the contract on Etherscan", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hTokenFactory: HToken__factory = new HToken__factory(signers[0]);
    const hToken: HToken = <HToken>(
      await hTokenFactory.deploy(
        taskArgs.name,
        taskArgs.symbol,
        taskArgs.maturity,
        taskArgs.balanceSheet,
        taskArgs.fintroller,
        taskArgs.underlying,
      )
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, { contract: hToken, confirmations: taskArgs.confirmations });

    if (taskArgs.print) {
      console.table([{ name: "HToken", address: hToken.address }]);
    }

    if (taskArgs.setOutput) {
      setOutput("h-token", hToken.address);
    }

    if (taskArgs.verify) {
      try {
        await run("verify:verify", {
          address: hToken.address,
          constructorArguments: [
            taskArgs.name,
            taskArgs.symbol,
            taskArgs.maturity,
            taskArgs.balanceSheet,
            taskArgs.fintroller,
            taskArgs.underlying,
          ],
        });
      } catch (error) {
        console.error("Error while verifying contract:", error);
      }
    }

    return hToken.address;
  });
