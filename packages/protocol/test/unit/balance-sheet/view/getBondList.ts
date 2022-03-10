import { expect } from "chai";

export function shouldBehaveLikeGetBondList(): void {
  context("when the bond list is empty", function () {
    it("returns an empty array", async function () {
      const bondList: string[] = await this.contracts.balanceSheet.getBondList(this.signers.borrower.address);
      expect(bondList).to.be.empty;
    });
  });

  context("when the bond list is not empty", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.__godMode_setBondList(this.signers.borrower.address, [
        this.mocks.hTokens[0].address,
        this.mocks.hTokens[1].address,
      ]);
    });

    it("returns the list of bonds", async function () {
      const bondList: string[] = await this.contracts.balanceSheet.getBondList(this.signers.borrower.address);
      expect(bondList).to.have.same.members([this.mocks.hTokens[0].address, this.mocks.hTokens[1].address]);
    });
  });
}
