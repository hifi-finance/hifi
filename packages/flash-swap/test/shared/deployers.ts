import type { Signer } from "@ethersproject/abstract-signer";
import type { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "ethers";
import { artifacts, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { GodModeErc20 } from "../../src/types/contracts/test/GodModeErc20";
import type { UniswapV3Pool } from "../../src/types/contracts/uniswap-v3/UniswapV3Pool";
import { UniswapV3Pool__factory } from "../../src/types/factories/contracts/uniswap-v3/UniswapV3Pool__factory";

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

export async function createUniswapV3Pool(
  deployer: Signer,
  uniswapV3Factory: Contract,
  token0: string,
  token1: string,
  fee: number,
): Promise<UniswapV3Pool> {
  await uniswapV3Factory.createPool(token0, token1, fee);
  const v3PoolAddress: string = await uniswapV3Factory.getPool(token0, token1, fee);
  const uniswapV3Pool: UniswapV3Pool = UniswapV3Pool__factory.connect(v3PoolAddress, deployer);
  return uniswapV3Pool;
}
