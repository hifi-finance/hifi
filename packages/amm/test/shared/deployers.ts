import { Signer } from "@ethersproject/abstract-signer";
import { artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";

import { H_TOKEN_MATURITY_ONE_YEAR, USDC_DECIMALS, USDC_NAME, USDC_SYMBOL } from "@hifi/constants";
import { GodModeHifiPoolRegistry, GodModeHToken } from "../../typechain";
import { GodModeErc20 } from "../../typechain/GodModeErc20";
import { GodModeHifiPool } from "../../typechain/GodModeHifiPool";
import { getHTokenName, getHifiPoolName, getHTokenSymbol, getHifiPoolSymbol } from "@hifi/helpers";

const { deployContract } = waffle;

export async function deployUsdc(deployer: Signer): Promise<GodModeErc20> {
  const godModeErc20Artifact: Artifact = await artifacts.readArtifact("GodModeErc20");
  const godModeErc20: GodModeErc20 = <GodModeErc20>(
    await deployContract(deployer, godModeErc20Artifact, [USDC_NAME, USDC_SYMBOL, USDC_DECIMALS])
  );
  return godModeErc20;
}

export async function deployGodModeHToken(deployer: Signer, underlyingAddress: string): Promise<GodModeHToken> {
  const godModeHTokenArtifact: Artifact = await artifacts.readArtifact("GodModeHToken");
  const godModeHToken: GodModeHToken = <GodModeHToken>(
    await deployContract(deployer, godModeHTokenArtifact, [
      getHTokenName(H_TOKEN_MATURITY_ONE_YEAR),
      getHTokenSymbol(H_TOKEN_MATURITY_ONE_YEAR),
      H_TOKEN_MATURITY_ONE_YEAR,
      underlyingAddress,
    ])
  );
  return godModeHToken;
}

export async function deployHifiPool(deployer: Signer, hTokenAddress: string): Promise<GodModeHifiPool> {
  const hifiPoolArtifact: Artifact = await artifacts.readArtifact("GodModeHifiPool");
  const hifiPool: GodModeHifiPool = <GodModeHifiPool>(
    await deployContract(deployer, hifiPoolArtifact, [
      getHifiPoolName(H_TOKEN_MATURITY_ONE_YEAR),
      getHifiPoolSymbol(H_TOKEN_MATURITY_ONE_YEAR),
      hTokenAddress,
    ])
  );
  return hifiPool;
}

export async function deployHifiPoolRegistry(deployer: Signer): Promise<GodModeHifiPoolRegistry> {
  const hifiPoolRegistryArtifact: Artifact = await artifacts.readArtifact("GodModeHifiPoolRegistry");
  const hifiPoolRegistry: GodModeHifiPoolRegistry = <GodModeHifiPoolRegistry>(
    await deployContract(deployer, hifiPoolRegistryArtifact)
  );
  return hifiPoolRegistry;
}
