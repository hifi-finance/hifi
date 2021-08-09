import { Block } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { bn } from "@hifi/helpers";
import { ethers } from "hardhat";

export async function getLatestBlockTimestamp(): Promise<BigNumber> {
  const block: Block = await ethers.provider.getBlock("latest");
  return bn(String(block.timestamp));
}
