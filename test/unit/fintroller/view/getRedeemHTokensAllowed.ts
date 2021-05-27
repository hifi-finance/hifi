import { expect } from "chai";

import { GenericErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeGetRedeemHTokensAllowed(): void {
  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.getRedeemHTokensAllowed(this.stubs.hToken.address)).to.be.revertedWith(
        GenericErrors.BondNotListed,
      );
    });
  });

  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.hToken.address);
    });

    it("retrieves the default value", async function () {
      const redeemHTokensAllowed: boolean = await this.contracts.fintroller.getRedeemHTokensAllowed(
        this.stubs.hToken.address,
      );
      expect(redeemHTokensAllowed).to.equal(true);
    });
  });
}
