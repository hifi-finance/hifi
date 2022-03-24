import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { HifiPool } from "../../src/types/HifiPool";
import { HifiPoolRegistry } from "../../src/types/HifiPoolRegistry";
import { HifiPoolRegistry__factory } from "../../src/types/factories/HifiPoolRegistry__factory";
import { HifiPool__factory } from "../../src/types/factories/HifiPool__factory";
import { TASK_DEPLOY_CONTRACT_HIFI_POOL } from "../constants";

task(TASK_DEPLOY_CONTRACT_HIFI_POOL)
  // Contract arguments
  .addParam("name", "ERC-20 name of the pool token")
  .addParam("symbol", "ERC-20 symbol of the pool token")
  .addParam("hToken", "Address of the HToken contract")
  .addParam("hifiPoolRegistry", "Address of the HifiPoolRegistry contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("print", "Print the address in the console", true, types.boolean)
  .addOptionalParam("verify", "Verify the contract on Etherscan", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
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

    if (taskArgs.print) {
      console.table([{ name: "HifiPool", address: hifiPool.address }]);
    }

    if (taskArgs.verify) {
      try {
        await run("verify:verify", {
          address: hifiPool.address,
          constructorArguments: [taskArgs.name, taskArgs.symbol, taskArgs.hToken],
        });
      } catch (error) {
        console.error("Error while verifying contract:", error);
      }
    }

    return hifiPool.address;
  });
