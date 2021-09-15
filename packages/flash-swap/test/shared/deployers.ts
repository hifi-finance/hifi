import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";

import { GodModeErc20 } from "../../typechain/GodModeErc20";

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
