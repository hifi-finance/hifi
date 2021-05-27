import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetBondDebtCeiling(): void {
  context("when the bond is not listed", function () {
    it("retrieves zero", async function () {
      const bondDebtCeiling: BigNumber = await this.contracts.fintroller.getBondDebtCeiling(this.stubs.hToken.address);
      expect(bondDebtCeiling).to.equal(Zero);
    });
  });

  context("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.hToken.address);
    });

    it("retrieves the default debt ceiling", async function () {
      const bondDebtCeiling: BigNumber = await this.contracts.fintroller.getBondDebtCeiling(this.stubs.hToken.address);
      expect(bondDebtCeiling).to.equal(Zero);
    });
  });
}
