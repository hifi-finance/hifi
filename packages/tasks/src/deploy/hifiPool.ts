import * as core from "@actions/core";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { HifiPool__factory } from "@hifi/amm/dist/types/factories/HifiPool__factory";
import { HifiPoolRegistry__factory } from "@hifi/amm/dist/types/factories/HifiPoolRegistry__factory";
import { HifiPool } from "@hifi/amm/dist/types/HifiPool";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TASK_DEPLOY_CONTRACT_HIFI_POOL } from "../../helpers/constants";
import { HifiPoolRegistry } from "@hifi/amm/dist/types/HifiPoolRegistry";

task(TASK_DEPLOY_CONTRACT_HIFI_POOL)
  // Contract arguments
  .addParam("name", "ERC-20 name of the pool token")
  .addParam("symbol", "ERC-20 symbol of the pool token")
  .addParam("hToken", "Address of the HToken contract")
  .addParam("hifiPoolRegistry", "Address of the HifiPoolRegistry contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hifiPoolFactory: HifiPool__factory = new HifiPool__factory(signers[0]);
    const hifiPool: HifiPool = <HifiPool>await hifiPoolFactory.deploy(taskArgs.name, taskArgs.symbol, taskArgs.hToken);
    await hifiPool.deployed();

    const hifiPoolRegistryFactory: HifiPoolRegistry__factory = new HifiPoolRegistry__factory(signers[0]);
    const hifiPoolRegistry: HifiPoolRegistry = <HifiPoolRegistry>(
      hifiPoolRegistryFactory.attach(taskArgs.hifiPoolRegistry)
    );
    const trackPoolTx = await hifiPoolRegistry.trackPool(hifiPool.address);
    if (taskArgs.confirmations > 0) {
      await trackPoolTx.wait(taskArgs.confirmations);
    }

    if (taskArgs.setOutput) {
      core.setOutput("hifi-pool", hifiPool.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "HifiPool", address: hifiPool.address }]);
    }

    return hifiPool.address;
  });
