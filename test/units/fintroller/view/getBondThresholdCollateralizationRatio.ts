import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { OnePercentMantissa } from "../../../helpers/constants";

export default function shouldBehaveLikeGetBondThresholdCollateralizationRatio(): void {
  /* Equivalent to 175% */
  const newCollateralizationRatioMantissa: BigNumber = OnePercentMantissa.mul(175);

  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.listBond(this.stubs.yToken.address);
      await this.contracts.fintroller.setCollateralizationRatio(
        this.stubs.yToken.address,
        newCollateralizationRatioMantissa,
      );
    });

    it("retrieves the bond's threshold collateralization ratio", async function () {
      const bondThresholdCollateralizationRatio: BigNumber = await this.contracts.fintroller.getBondThresholdCollateralizationRatio(
        this.stubs.yToken.address,
      );
      expect(bondThresholdCollateralizationRatio).to.equal(newCollateralizationRatioMantissa);
    });
  });

  describe("when the bond is not listed", function () {
    it("retrieves a zero value", async function () {
      const bondCollateralizationRatio: BigNumber = await this.contracts.fintroller.getBondThresholdCollateralizationRatio(
        this.stubs.yToken.address,
      );
      expect(bondCollateralizationRatio).to.equal(Zero);
    });
  });
}
