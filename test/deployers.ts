import { Signer } from "@ethersproject/abstract-signer";
import { waffle } from "hardhat";

import HifiFlashSwapArtifact from "../artifacts/contracts/HifiFlashSwap.sol/HifiFlashSwap.json";
import { HifiFlashSwap } from "../typechain/HifiFlashSwap";

const { deployContract } = waffle;

export async function deployHifiFlashSwap(
  deployer: Signer,
  fintrollerAddress: string,
  balanceSheetAddress: string,
  uniswapV2PairAddress: string,
): Promise<HifiFlashSwap> {
  const hifiFlashSwap: HifiFlashSwap = (await deployContract(deployer, HifiFlashSwapArtifact, [
    fintrollerAddress,
    balanceSheetAddress,
    uniswapV2PairAddress,
  ])) as HifiFlashSwap;
  return hifiFlashSwap;
}
