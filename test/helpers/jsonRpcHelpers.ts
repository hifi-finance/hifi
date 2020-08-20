import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "@nomiclabs/buidler";

export async function increaseTime(timestamp: BigNumber): Promise<void> {
  await ethers.provider.send("evm_increaseTime", [timestamp.toNumber()]);
}
