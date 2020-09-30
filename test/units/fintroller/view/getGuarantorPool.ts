import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { OnePercentMantissa } from "../../../helpers/constants";

export default function shouldBehaveLikeGetGuarantorPool(): void {
  describe("when the guarantor pool is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.listGuarantorPool(this.stubs.guarantorPool.address);
    });

    it("retrieves all the storage properties of the guarantor pool", async function () {
      const guarantorPool = await this.contracts.fintroller.getGuarantorPool(this.stubs.guarantorPool.address);
      expect(guarantorPool.isDepositGuarantyAllowed).to.equal(false);
      expect(guarantorPool.isListed).to.equal(true);
      expect(guarantorPool.isWithdrawGuarantyAndClutchedCollateralAllowed).to.equal(false);
    });
  });

  describe("when the guarantor pool is not listed", function () {
    it("retrieves a non-listed guarantor pool", async function () {
      const guarantorPool = await this.contracts.fintroller.getGuarantorPool(this.stubs.guarantorPool.address);
      expect(guarantorPool.isListed).to.equal(false);
    });
  });
}
