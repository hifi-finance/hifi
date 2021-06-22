import { Signer } from "@ethersproject/abstract-signer";
import { artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";

import {
  HIFI_POOL_NAME,
  HIFI_POOL_SYMBOL,
  H_TOKEN_EXPIRATION_TIME,
  H_TOKEN_NAME,
  H_TOKEN_SYMBOL,
  USDC_DECIMALS,
  USDC_NAME,
  USDC_SYMBOL,
} from "../../helpers/constants";
import { GodModeHToken } from "../../typechain";
import { GodModeErc20 } from "../../typechain/GodModeErc20";
import { GodModeHifiPool } from "../../typechain/GodModeHifiPool";

const { deployContract } = waffle;

export async function deployUsdc(deployer: Signer): Promise<GodModeErc20> {
  const godModeErc20Artifact: Artifact = await artifacts.readArtifact("GodModeErc20");
  const godModeErc20: GodModeErc20 = <GodModeErc20>(
    await deployContract(deployer, godModeErc20Artifact, [USDC_NAME, USDC_SYMBOL, USDC_DECIMALS])
  );
  return godModeErc20;
}

export async function deployGodModeHToken(deployer: Signer): Promise<GodModeHToken> {
  const godModeHTokenArtifact: Artifact = await artifacts.readArtifact("GodModeHToken");
  const godModeHToken: GodModeHToken = <GodModeHToken>(
    await deployContract(deployer, godModeHTokenArtifact, [H_TOKEN_NAME, H_TOKEN_SYMBOL, H_TOKEN_EXPIRATION_TIME])
  );
  return godModeHToken;
}

export async function deployHifiPool(
  deployer: Signer,
  hTokenAddress: string,
  underlyingAddress: string,
): Promise<GodModeHifiPool> {
  const hifiPoolArtifact: Artifact = await artifacts.readArtifact("GodModeHifiPool");
  const hifiPool: GodModeHifiPool = <GodModeHifiPool>(
    await deployContract(deployer, hifiPoolArtifact, [
      HIFI_POOL_NAME,
      HIFI_POOL_SYMBOL,
      hTokenAddress,
      underlyingAddress,
    ])
  );
  return hifiPool;
}
