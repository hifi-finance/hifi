import type { Signer } from "@ethersproject/abstract-signer";
import type { BigNumber } from "@ethersproject/bignumber";
import { artifacts, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { GodModeErc20 } from "../../src/types/contracts/test/GodModeErc20";

export async function deployGodModeErc20(
  deployer: Signer,
  name: string,
  symbol: string,
  decimals: BigNumber,
): Promise<GodModeErc20> {
  const godModeErc20Artifact: Artifact = await artifacts.readArtifact("GodModeErc20");
  const godModeErc20: GodModeErc20 = <GodModeErc20>(
    await waffle.deployContract(deployer, godModeErc20Artifact, [name, symbol, decimals])
  );
  return godModeErc20;
}
