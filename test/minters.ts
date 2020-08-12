import { BigNumber } from "@ethersproject/bignumber";
import { Wallet } from "@ethersproject/wallet";

import { Erc20Mintable } from "../typechain/Erc20Mintable";

/**
 * @dev This functions assumes that both `superMinter` and the token contract are deployed.
 */
export async function mintAndDistributeTokens(
  this: Mocha.Context,
  token: Erc20Mintable,
  amount: BigNumber,
  wallets: Wallet[],
): Promise<void> {
  const walletAddresses: string[] = [];
  for (let i: number = 0; i < wallets.length; i += 1) {
    walletAddresses.push(await wallets[i].getAddress());
  }
  const totalAmountToMint: BigNumber = amount.mul(wallets.length);
  await token.mint(this.superMinter.address, totalAmountToMint);
  await this.superMinter.distributeTokensToAccounts(token.address, amount, walletAddresses);
}
