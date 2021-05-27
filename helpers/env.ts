import { TransactionRequest } from "@ethersproject/providers";

import { GAS_LIMIT_HARDHAT, GAS_LIMIT_COVERAGE } from "./constants";

export function getDeployContractOverrides(): TransactionRequest {
  return {
    gasLimit: process.env.CODE_COVERAGE ? GAS_LIMIT_COVERAGE : GAS_LIMIT_HARDHAT,
  };
}

export function getEnvVar(key: string): string {
  if (!process.env[key]) {
    throw new Error(`Please set ${key} as an env variable`);
  }
  return process.env[key] || "";
}
