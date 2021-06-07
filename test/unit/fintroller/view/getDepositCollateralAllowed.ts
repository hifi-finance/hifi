import { expect } from "chai";

import { GenericErrors } from "../../../shared/errors";

export default function shouldBehaveLikeGetDepositCollateralAllowed(): void {
  context("when the collateral is not listed", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.getDepositCollateralAllowed(this.mocks.wbtc.address)).to.be.revertedWith(
        GenericErrors.CollateralNotListed,
      );
    });
  });

  context("when the collateral is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.mocks.wbtc.address);
    });

    it("retrieves the default value", async function () {
      const depositCollateralAllowed: boolean = await this.contracts.fintroller.getDepositCollateralAllowed(
        this.mocks.wbtc.address,
      );
      expect(depositCollateralAllowed).to.equal(true);
    });
  });
}
