import { BigNumber } from "@ethersproject/bignumber";
import { Wallet } from "@ethersproject/wallet";

/**
 * @dev This functions assumes that both `superMinter` and `underlying` are deployed.
 */
export async function mintAndDistributeUnderlyingTokens(
  this: Mocha.Context,
  amount: BigNumber,
  wallets: Wallet[],
): Promise<void> {
  const walletAddresses: string[] = [];
  for (let i: number = 0; i < wallets.length; i += 1) {
    walletAddresses.push(await wallets[i].getAddress());
  }
  const totalAmountToMint: BigNumber = amount.mul(wallets.length);
  await this.underlying.mint(this.superMinter.address, totalAmountToMint);
  await this.superMinter.distributeTokensToAccounts(this.underlying.address, amount, walletAddresses);
}
