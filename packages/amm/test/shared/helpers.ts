import { Block } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";

export async function getLatestBlockTimestamp(): Promise<BigNumber> {
  const block: Block = await ethers.provider.getBlock("latest");
  return BigNumber.from(block.timestamp);
}
