import { HToken } from "@hifi/protocol/typechain/HToken";
import { HToken__factory } from "@hifi/protocol/typechain/factories/HToken__factory";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TASK_DEPLOY_H_TOKEN } from "../constants";

task(TASK_DEPLOY_H_TOKEN)
  .addParam("name", "The ERC-20 name of the hToken")
  .addParam("symbol", "The ERC-20 symbol of the hToken")
  .addParam("maturity", "Unix timestamp for when the hToken matures")
  .addParam("balanceSheet", "The address of the BalanceSheet contract")
  .addParam("underlying", "The address of the underlying ERC-20 contract")
  .addOptionalParam("printAddress", "Whether to print the address in the console", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers }): Promise<string> {
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
    await hToken.deployed();
    if (taskArgs.printAddress) {
      console.table([{ name: "HToken", address: hToken.address }]);
    }
    return hToken.address;
  });