import { BigNumber } from "@ethersproject/bignumber";
import { One, Zero } from "@ethersproject/constants";
import { Wallet } from "@ethersproject/wallet";
import { expect } from "chai";

import { Errors, FintrollerErrors } from "../../errors";
import { DecimalsPerToken } from "../../constants";

export default function shouldBehaveLikeSetCollateralizationRatio(_admin: Wallet, eve: Wallet): void {
  describe("when the caller is the admin", function () {
    describe("when the value of the collateralization ratio is not valid", function () {
      describe("when the collateralization ratio is higher than 10,000%", function () {
        it("reverts", async function () {
          const overflowCollateralizationRatioMantissa: BigNumber = One.mul(DecimalsPerToken).mul(100).add(1);
          await expect(
            this.fintroller.setCollateralizationRatio(overflowCollateralizationRatioMantissa),
          ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioOverflow);
        });
      });

      describe("when the collateralization ratio is lower than 100%", function () {
        it("reverts", async function () {
          const underflowCollateralizationRatioMantissa: BigNumber = One.mul(DecimalsPerToken).sub(1);
          await expect(
            this.fintroller.setCollateralizationRatio(underflowCollateralizationRatioMantissa),
          ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioUnderflow);
        });
      });

      describe("when the collateralization ratio is zero", function () {
        it("reverts", async function () {
          await expect(this.fintroller.setCollateralizationRatio(Zero)).to.be.revertedWith(
            FintrollerErrors.SetCollateralizationRatioUnderflow,
          );
        });
      });
    });
  });

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.fintroller.connect(eve).setCollateralizationRatio(this.scenario.fintroller.collateralizationRatio),
      ).to.be.revertedWith(Errors.NotAuthorized);
    });
  });
}
