import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { COLLATERALIZATION_RATIOS } from "@hifi/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetCollateralizationRatio(): void {
  context("when the collateral is not listed", function () {
    it("retrieves zero", async function () {
      const collateralizationRatio: BigNumber = await this.contracts.fintroller.getCollateralizationRatio(
        this.mocks.wbtc.address,
      );
      expect(collateralizationRatio).to.equal(Zero);
    });
  });

  context("when the collateral is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.mocks.wbtc.address);
    });

    it("retrieves the default collateralization ratio", async function () {
      const collateralizationRatio: BigNumber = await this.contracts.fintroller.getCollateralizationRatio(
        this.mocks.wbtc.address,
      );
      expect(collateralizationRatio).to.equal(COLLATERALIZATION_RATIOS.default);
    });
  });
}
