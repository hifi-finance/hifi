import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { fintrollerConstants } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetBondCollateralizationRatio(): void {
  describe("when the bond is not listed", function () {
    it("retrieves zero", async function () {
      const bondCollateralizationRatio: BigNumber = await this.contracts.fintroller.getBondCollateralizationRatio(
        this.stubs.hToken.address,
      );
      expect(bondCollateralizationRatio).to.equal(Zero);
    });
  });

  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.hToken.address);
    });

    it("retrieves the default collateralization ratio", async function () {
      const collateralizationRatio: BigNumber = await this.contracts.fintroller.getBondCollateralizationRatio(
        this.stubs.hToken.address,
      );
      expect(collateralizationRatio).to.equal(fintrollerConstants.defaultCollateralizationRatio);
    });
  });
}
