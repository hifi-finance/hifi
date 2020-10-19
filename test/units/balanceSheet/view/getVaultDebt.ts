import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetVaultDebt(): void {
  describe("when the bond is not open", function () {
    it("retrieves the default value", async function () {
      const debt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
        this.stubs.yToken.address,
        this.accounts.borrower,
      );
      expect(debt).to.equal(Zero);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.yToken.address);
    });

    it("retrieves the default value", async function () {
      const debt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
        this.stubs.yToken.address,
        this.accounts.borrower,
      );
      expect(debt).to.equal(Zero);
    });
  });
}
