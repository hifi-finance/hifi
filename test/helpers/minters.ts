import { BigNumber } from "@ethersproject/bignumber";
import { Signer } from "@ethersproject/abstract-signer";

import { Erc20Mintable } from "../../typechain/Erc20Mintable";

/**
 * @dev This functions assumes that both `superMinter` and the token contract are deployed.
 */
export async function mintAndDistributeTokens(
  this: Mocha.Context,
  token: Erc20Mintable,
  amount: BigNumber,
  wallets: Signer[],
): Promise<void> {
  const totalAmountToMint: BigNumber = amount.mul(wallets.length);
  await token.mint(this.superMinter.address, totalAmountToMint);
  await this.superMinter.distributeTokensToAccounts(token.address, amount, [
    this.adminAddress,
    this.bradAddress,
    this.graceAddress,
    this.lucyAddress,
    this.eveAddress,
  ]);
}
