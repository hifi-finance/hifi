import type { Signer } from "@ethersproject/abstract-signer";
import { H_TOKEN_MATURITY_ONE_YEAR, USDC_DECIMALS, USDC_NAME, USDC_SYMBOL } from "@hifi/constants";
import { getHTokenName, getHTokenSymbol, getHifiPoolName, getHifiPoolSymbol } from "@hifi/helpers";
import { artifacts, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { GodModeErc20 } from "../../src/types/GodModeErc20";
import type { GodModeHToken } from "../../src/types/GodModeHToken";
import type { GodModeHifiPool } from "../../src/types/GodModeHifiPool";
import type { GodModeHifiPoolRegistry } from "../../src/types/GodModeHifiPoolRegistry";

export async function deployUsdc(deployer: Signer): Promise<GodModeErc20> {
  const godModeErc20Artifact: Artifact = await artifacts.readArtifact("GodModeErc20");
  const godModeErc20: GodModeErc20 = <GodModeErc20>(
    await waffle.deployContract(deployer, godModeErc20Artifact, [USDC_NAME, USDC_SYMBOL, USDC_DECIMALS])
  );
  return godModeErc20;
}

export async function deployGodModeHToken(deployer: Signer, underlyingAddress: string): Promise<GodModeHToken> {
  const godModeHTokenArtifact: Artifact = await artifacts.readArtifact("GodModeHToken");
  const godModeHToken: GodModeHToken = <GodModeHToken>(
    await waffle.deployContract(deployer, godModeHTokenArtifact, [
      getHTokenName(H_TOKEN_MATURITY_ONE_YEAR),
      getHTokenSymbol(H_TOKEN_MATURITY_ONE_YEAR),
      H_TOKEN_MATURITY_ONE_YEAR,
      underlyingAddress,
    ])
  );
  return godModeHToken;
}

export async function deployGodModeHifiPool(deployer: Signer, hTokenAddress: string): Promise<GodModeHifiPool> {
  const godModeHifiPoolArtifact: Artifact = await artifacts.readArtifact("GodModeHifiPool");
  const hifiPool: GodModeHifiPool = <GodModeHifiPool>(
    await waffle.deployContract(deployer, godModeHifiPoolArtifact, [
      getHifiPoolName(H_TOKEN_MATURITY_ONE_YEAR),
      getHifiPoolSymbol(H_TOKEN_MATURITY_ONE_YEAR),
      hTokenAddress,
    ])
  );
  return hifiPool;
}

export async function deployGodModeHifiPoolRegistry(deployer: Signer): Promise<GodModeHifiPoolRegistry> {
  const godModeHifiPoolRegistryArtifact: Artifact = await artifacts.readArtifact("GodModeHifiPoolRegistry");
  const hifiPoolRegistry: GodModeHifiPoolRegistry = <GodModeHifiPoolRegistry>(
    await waffle.deployContract(deployer, godModeHifiPoolRegistryArtifact)
  );
  return hifiPoolRegistry;
}
