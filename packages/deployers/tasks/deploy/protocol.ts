import * as core from "@actions/core";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import {
  TASK_DEPLOY_CONTRACT_CHAINLINK_OPERATOR,
  TASK_DEPLOY_CONTRACT_HIFI_POOL,
  TASK_DEPLOY_CONTRACT_HIFI_POOL_REGISTRY,
  TASK_DEPLOY_CONTRACT_HIFI_PROXY_TARGET,
  TASK_DEPLOY_CONTRACT_H_TOKEN,
  TASK_DEPLOY_PROTOCOL,
} from "../constants";

task(TASK_DEPLOY_PROTOCOL)
  // Contract arguments
  .addParam("balanceSheet", "Address of the BalanceSheet contract")
  .addParam("hifiPoolName", "ERC-20 name of the pool token")
  .addParam("hifiPoolSymbol", "ERC-20 symbol of the pool token")
  .addParam("hTokenMaturity", "Unix timestamp for when the hToken matures")
  .addParam("hTokenName", "ERC-20 name of the hToken")
  .addParam("hTokenSymbol", "ERC-20 symbol of the hToken")
  .addParam("underlying", "Address of the underlying ERC-20 contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddresses", "Print the addresses in the console", true, types.boolean)
  .addOptionalParam("setOutputs", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { run }) {
    const chainlinkOperator: string = await run(TASK_DEPLOY_CONTRACT_CHAINLINK_OPERATOR, {
      confirmations: 0,
      printAddress: false,
      setOutput: false,
    });
    const hifiPoolRegistry: string = await run(TASK_DEPLOY_CONTRACT_HIFI_POOL_REGISTRY, {
      confirmations: 0,
      printAddress: false,
      setOutput: false,
    });
    const hifiProxyTarget: string = await run(TASK_DEPLOY_CONTRACT_HIFI_PROXY_TARGET, {
      confirmations: 0,
      printAddress: false,
      setOutput: false,
    });

    const hToken: string = await run(TASK_DEPLOY_CONTRACT_H_TOKEN, {
      balanceSheet: taskArgs.balanceSheet,
      maturity: taskArgs.hTokenMaturity,
      name: taskArgs.hTokenName,
      symbol: taskArgs.hTokenSymbol,
      underlying: taskArgs.underlying,
      confirmations: 0,
      printAddress: false,
      setOutput: false,
    });

    const hifiPool: string = await run(TASK_DEPLOY_CONTRACT_HIFI_POOL, {
      name: taskArgs.hifiPoolName,
      symbol: taskArgs.hifiPoolSymbol,
      hToken,
      confirmations: taskArgs.confirmations,
      printAddress: false,
      setOutput: false,
    });

    if (taskArgs.setOutputs) {
      core.setOutput("chainlink-operator", chainlinkOperator);
      core.setOutput("hifi-pool-registry", hifiPoolRegistry);
      core.setOutput("hifi-proxy-target", hifiProxyTarget);
      core.setOutput("h-token", hToken);
      core.setOutput("hifi-pool", hifiPool);
    }

    if (taskArgs.printAddresses) {
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
