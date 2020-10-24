import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { fintrollerConstants } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetBondCollateralizationRatio(): void {
  describe("when the bond is not listed", function () {
    it("retrieves zero", async function () {
      const bondCollateralizationRatio: BigNumber = await this.contracts.fintroller.getBondCollateralizationRatio(
        this.stubs.fyToken.address,
      );
      expect(bondCollateralizationRatio).to.equal(Zero);
    });
  });

  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.listBond(this.stubs.fyToken.address);
    });

    it("retrieves the default collateralization ratio", async function () {
      const collateralizationRatioMantissa: BigNumber = await this.contracts.fintroller.getBondCollateralizationRatio(
        this.stubs.fyToken.address,
      );
      expect(collateralizationRatioMantissa).to.equal(fintrollerConstants.defaultCollateralizationRatio);
    });
  });
}
