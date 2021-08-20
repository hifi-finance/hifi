import * as core from "@actions/core";
import { HToken } from "@hifi/protocol/typechain/HToken";
import { HToken__factory } from "@hifi/protocol/typechain/factories/HToken__factory";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_H_TOKEN } from "../../helpers/constants";

task(TASK_DEPLOY_CONTRACT_H_TOKEN)
  // Contract arguments
  .addParam("name", "ERC-20 name of the hToken")
  .addParam("symbol", "ERC-20 symbol of the hToken")
  .addParam("maturity", "Unix timestamp for when the hToken matures")
  .addParam("balanceSheet", "Address of the BalanceSheet contract")
  .addParam("underlying", "Address of the underlying ERC-20 contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hTokenFactory: HToken__factory = new HToken__factory(signers[0]);
    const hToken: HToken = <HToken>(
      await hTokenFactory.deploy(
        taskArgs.name,
        taskArgs.symbol,
        taskArgs.maturity,
        taskArgs.balanceSheet,
        taskArgs.underlying,
      )
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, { contract: hToken, confirmations: taskArgs.confirmations });

    if (taskArgs.setOutput) {
      core.setOutput("hifi-token", hToken.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "HToken", address: hToken.address }]);
    }
    return hToken.address;
  });
