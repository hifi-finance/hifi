import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { OneHundredTokens, OneThousandPercentMantissa, TenTokens } from "../../../utils/constants";

export default function shouldBehaveLikeGetCurrentCollateralizationRatio(): void {
  const lockedCollateral: BigNumber = TenTokens;
  const debt: BigNumber = OneHundredTokens;

  beforeEach(async function () {
    await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
    await this.contracts.balanceSheet.__godMode_setVaultLockedCollateral(
      this.stubs.yToken.address,
      this.accounts.brad,
      lockedCollateral,
    );
    await this.contracts.balanceSheet.__godMode_setVaultDebt(this.stubs.yToken.address, this.accounts.brad, debt);
  });

  it("returns the current collateralization ratio mantissa", async function () {
    const currentCollateralizationRatioMantissa: BigNumber = await this.contracts.balanceSheet.getCurrentCollateralizationRatio(
      this.stubs.yToken.address,
      this.accounts.brad,
    );
    expect(currentCollateralizationRatioMantissa).to.equal(OneThousandPercentMantissa);
  });
}
