import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { percentages, tokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetCurrentCollateralizationRatio(): void {
  const debt: BigNumber = tokenAmounts.oneHundred;
  const lockedCollateral: BigNumber = tokenAmounts.ten;

  beforeEach(async function () {
    await this.stubs.fintroller.mock.isBondListed.withArgs(this.stubs.fyToken.address).returns(true);
    await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address);
    await this.contracts.balanceSheet.__godMode_setVaultLockedCollateral(
      this.stubs.fyToken.address,
      this.signers.borrower.address,
      lockedCollateral,
    );
    await this.contracts.balanceSheet.__godMode_setVaultDebt(
      this.stubs.fyToken.address,
      this.signers.borrower.address,
      debt,
    );
  });

  it("returns the current collateralization ratio mantissa", async function () {
    const currentCollateralizationRatioMantissa: BigNumber = await this.contracts.balanceSheet.getCurrentCollateralizationRatio(
      this.stubs.fyToken.address,
      this.signers.borrower.address,
    );
    expect(currentCollateralizationRatioMantissa).to.equal(percentages.oneThousand);
  });
}
