import * as core from "@actions/core";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { HifiPool__factory } from "@hifi/amm/typechain/factories/HifiPool__factory";
import { HifiPoolRegistry__factory } from "@hifi/amm/typechain/factories/HifiPoolRegistry__factory";
import { HifiPool } from "@hifi/amm/typechain/HifiPool";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_HIFI_POOL } from "../../helpers/constants";
import { HifiPoolRegistry } from "@hifi/amm/typechain/HifiPoolRegistry";

task(TASK_DEPLOY_CONTRACT_HIFI_POOL)
  // Contract arguments
  .addParam("name", "ERC-20 name of the pool token")
  .addParam("symbol", "ERC-20 symbol of the pool token")
  .addParam("hToken", "Address of the hToken contract")
  .addParam("hifiPoolRegistry", "Address of the hifiPoolRegistry contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hifiPoolFactory: HifiPool__factory = new HifiPool__factory(signers[0]);
    const hifiPool: HifiPool = <HifiPool>await hifiPoolFactory.deploy(taskArgs.name, taskArgs.symbol, taskArgs.hToken);

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, { contract: hifiPool, confirmations: taskArgs.confirmations });

    const hifiPoolRegistryFactory: HifiPoolRegistry__factory = new HifiPoolRegistry__factory(signers[0]);
    const hifiPoolRegistry: HifiPoolRegistry = <HifiPoolRegistry>(
      hifiPoolRegistryFactory.attach(taskArgs.hifiPoolRegistry)
    );

    await hifiPoolRegistry.trackPool(hifiPool.address);

    if (taskArgs.setOutput) {
      core.setOutput("hifi-pool", hifiPool.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "HifiPool", address: hifiPool.address }]);
    }

    return hifiPool.address;
  });
