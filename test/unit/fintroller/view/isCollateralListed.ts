import { expect } from "chai";

export default function shouldBehaveLikeIsCollateralListed(): void {
  context("when the collateral is not listed", function () {
    it("retrieves false", async function () {
      const isCollateralListed: boolean = await this.contracts.fintroller.isCollateralListed(this.mocks.wbtc.address);
      expect(isCollateralListed).to.equal(false);
    });
  });

  context("when the collateral is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.owner).listCollateral(this.mocks.wbtc.address);
    });

    it("retrieves true", async function () {
      const isCollateralListed: boolean = await this.contracts.fintroller.isCollateralListed(this.mocks.wbtc.address);
      expect(isCollateralListed).to.equal(true);
    });
  });
}
