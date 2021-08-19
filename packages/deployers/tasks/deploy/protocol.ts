import * as core from "@actions/core";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import {
  TASK_DEPLOY,
  TASK_DEPLOY_CHAINLINK_OPERATOR,
  TASK_DEPLOY_HIFI_POOL,
  TASK_DEPLOY_HIFI_POOL_REGISTRY,
  TASK_DEPLOY_HIFI_PROXY_TARGET,
  TASK_DEPLOY_H_TOKEN,
} from "../constants";

task(TASK_DEPLOY)
  .addParam("balanceSheet", "The address of the BalanceSheet contract")
  .addParam("hifiPoolName", "The ERC-20 name of the pool token")
  .addParam("hifiPoolSymbol", "The ERC-20 symbol of the pool token")
  .addParam("hTokenMaturity", "Unix timestamp for when the hToken matures")
  .addParam("hTokenName", "The ERC-20 name of the hToken")
  .addParam("hTokenSymbol", "The ERC-20 symbol of the hToken")
  .addParam("underlying", "The address of the underlying ERC-20 contract")
  .addOptionalParam("printAddresses", "Whether to print the address in the console", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { run }) {
    const chainlinkOperator: string = await run(TASK_DEPLOY_CHAINLINK_OPERATOR, { printAddress: false });
    const hifiPoolRegistry: string = await run(TASK_DEPLOY_HIFI_POOL_REGISTRY, { printAddress: false });
    const hifiProxyTarget: string = await run(TASK_DEPLOY_HIFI_PROXY_TARGET, { printAddress: false });

    const hToken: string = await run(TASK_DEPLOY_H_TOKEN, {
      balanceSheet: taskArgs.balanceSheet,
      maturity: taskArgs.hTokenMaturity,
      name: taskArgs.hTokenName,
      printAddress: false,
      symbol: taskArgs.hTokenSymbol,
      underlying: taskArgs.underlying,
    });

    const hifiPool: string = await run(TASK_DEPLOY_HIFI_POOL, {
      name: taskArgs.hifiPoolName,
      printAddress: false,
      symbol: taskArgs.hifiPoolSymbol,
      hToken,
    });

    if (taskArgs.printAddresses) {
      core.setOutput("chainlink-operator", chainlinkOperator);
      core.setOutput("hifi-pool-registry", hifiPoolRegistry);
      core.setOutput("hifi-proxy-target", hifiProxyTarget);
      core.setOutput("h-token", hToken);
      core.setOutput("hifi-pool", hifiPool);

      console.table([
        {
          name: "ChainlinkOperator",
          address: chainlinkOperator,
        },
        {
          name: "HifiPoolRegistry",
          address: hifiPoolRegistry,
        },
        {
          name: "HifiProxyTarget",
          address: hifiProxyTarget,
        },
        {
          name: "HToken",
          address: hToken,
        },
        {
          name: "HifiPool",
          address: hifiPool,
        },
      ]);
    }
  });
