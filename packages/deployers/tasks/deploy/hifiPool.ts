import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { HifiPool__factory } from "@hifi/amm/typechain/factories/HifiPool__factory";
import { HifiPool } from "@hifi/amm/typechain/HifiPool";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TASK_DEPLOY_HIFI_POOL } from "../constants";

task(TASK_DEPLOY_HIFI_POOL)
  .addParam("name", "The ERC-20 name of the pool token")
  .addParam("symbol", "The ERC-20 symbol of the pool token")
  .addParam("hToken", "The address of the hToken contract")
  .setAction(async function (taskArgs: TaskArguments, { ethers }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hifiPoolFactory: HifiPool__factory = new HifiPool__factory(signers[0]);
    const hifiPool: HifiPool = <HifiPool>await hifiPoolFactory.deploy(taskArgs.name, taskArgs.symbol, taskArgs.hToken);
    await hifiPool.deployed();
    return hifiPool.address;
  });
