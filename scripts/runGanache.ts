import Ganache from "ganache-core";

import scenarios from "../test/scenarios";
import { blockGasLimit, chainIds } from "../helpers/constants";

/* Ensure that we have all the environment variables we need. */
let mnemonic: string;
if (!process.env.MNEMONIC) {
  throw new Error("Please set your MNEMONIC in a .env file");
} else {
  mnemonic = process.env.MNEMONIC;
}

let alchemyApiKey: string;
if (!process.env.ALCHEMY_API_KEY) {
  throw new Error("Please set your ALCHEMY_API_KEY in a .env file");
} else {
  alchemyApiKey = process.env.ALCHEMY_API_KEY;
}

export async function runGanache(): Promise<void> {
  Ganache.provider({
    default_balance_ether: 1000000,
    fork: "https://eth-mainnet.alchemyapi.io/v2/" + alchemyApiKey,
    fork_block_number: scenarios.mainnet.oracle.deploymentBlockNumber.toNumber(),
    gasLimit: blockGasLimit.toNumber(),
    mnemonic,
    network_id: chainIds.mainnet,
  });
}

runGanache()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
