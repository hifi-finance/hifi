import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "@nomiclabs/buidler";

export async function setNextBlockTimestamp(timestamp: BigNumber): Promise<void> {
  await ethers.provider.send("evm_setNextBlockTimestamp", [timestamp.toNumber()]);
}
