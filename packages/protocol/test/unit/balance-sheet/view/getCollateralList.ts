import { expect } from "chai";

export function shouldBehaveLikeGetCollateralList(): void {
  context("when the collateral list is empty", function () {
    it("returns an empty array", async function () {
      const collateralList: string[] = await this.contracts.balanceSheet.getCollateralList(
        this.signers.borrower.address,
      );
      expect(collateralList).to.be.empty;
    });
  });

  context("when the collateral list is not empty", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.__godMode_setCollateralList(this.signers.borrower.address, [
        this.mocks.wbtc.address,
        this.mocks.weth.address,
      ]);
    });

    it("returns the list of bonds", async function () {
      const collateralList: string[] = await this.contracts.balanceSheet.getCollateralList(
        this.signers.borrower.address,
      );
      expect(collateralList).to.have.same.members([this.mocks.wbtc.address, this.mocks.weth.address]);
    });
  });
}
