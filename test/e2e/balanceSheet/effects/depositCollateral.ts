import { BigNumber } from "@ethersproject/bignumber";
import { formatEther } from "@ethersproject/units";
import { expect } from "chai";

import { tokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeDepositCollateral(): void {
  const collateralAmount: BigNumber = tokenAmounts.ten;

  beforeEach(async function () {
    /* Convert 10 ETH to WETH form. */
    await this.signers.borrower.sendTransaction({
      to: this.contracts.collateral.address,
      value: formatEther(BigNumber.from(10)),
    });
  });

  it("transfers the collateral", async function () {
    const oldBalance = await this.contracts.collateral.balanceOf(this.accounts.borrower);
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .depositCollateral(this.contracts.fyToken.address, collateralAmount);
    const newBalance = await this.contracts.collateral.balanceOf(this.accounts.borrower);
    expect(oldBalance).to.equal(newBalance.add(collateralAmount));
  });
}
