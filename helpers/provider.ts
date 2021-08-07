import { Block } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";

import { bn } from "./numbers";

export async function getLatestBlockTimestamp(): Promise<BigNumber> {
  const block: Block = await ethers.provider.getBlock("latest");
  return bn(String(block.timestamp));
}
