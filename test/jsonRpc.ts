import { BigNumber } from "@ethersproject/bignumber";
import { waffle } from "hardhat";

export async function increaseTime(timestamp: BigNumber): Promise<void> {
  await waffle.provider.send("evm_increaseTime", [timestamp.toNumber()]);
}
