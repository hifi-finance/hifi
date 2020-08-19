import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { Errors, FintrollerErrors } from "../../../helpers/errors";
import { FintrollerConstants, OnePercent } from "../../../helpers/constants";

export default function shouldBehaveLikeSetCollateralizationRatio(): void {
  /* Equivalent to 175% */
  const newCollateralizationRatioMantissa: BigNumber = OnePercent.mul(175);

  describe("when the caller is the admin", function () {
    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.fintroller.connect(this.admin).listBond(this.yToken.address);
      });

      describe("when the collateralization ratio is valid", function () {
        it("sets the new value", async function () {
          await this.fintroller
            .connect(this.admin)
            .setCollateralizationRatio(this.yToken.address, newCollateralizationRatioMantissa);
        });

        it("emits a NewCollateralizationRatio event", async function () {
          /* The second argument is the default value of the collateralization ratio */
          await expect(
            this.fintroller
              .connect(this.admin)
              .setCollateralizationRatio(this.yToken.address, newCollateralizationRatioMantissa),
          )
            .to.emit(this.fintroller, "NewCollateralizationRatio")
            .withArgs(
              this.yToken.address,
              FintrollerConstants.DefaultCollateralizationRatioMantissa,
              newCollateralizationRatioMantissa,
            );
        });
      });

      describe("when the value of the collateralization ratio is not valid", function () {
        describe("when the collateralization ratio is higher than 10,000%", function () {
          it("reverts", async function () {
            const overflowCollateralizationRatioMantissa: BigNumber = OnePercent.mul(10000).add(1);
            await expect(
              this.fintroller
                .connect(this.admin)
                .setCollateralizationRatio(this.yToken.address, overflowCollateralizationRatioMantissa),
            ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioOverflow);
          });
        });

        describe("when the collateralization ratio is lower than 100%", function () {
          it("reverts", async function () {
            const underflowCollateralizationRatioMantissa: BigNumber = OnePercent.mul(100).sub(1);
            await expect(
              this.fintroller
                .connect(this.admin)
                .setCollateralizationRatio(this.yToken.address, underflowCollateralizationRatioMantissa),
            ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioUnderflow);
          });
        });

        describe("when the collateralization ratio is zero", function () {
          it("reverts", async function () {
            await expect(
              this.fintroller.connect(this.admin).setCollateralizationRatio(this.yToken.address, Zero),
            ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioUnderflow);
          });
        });
      });
    });

    describe("when the bond is not listed", function () {
      it("reverts", async function () {
        const newCollateralizationRatioMantissa: BigNumber = this.scenario.fintroller.collateralizationRatio.add(1);
        await expect(
          this.fintroller
            .connect(this.admin)
            .setCollateralizationRatio(this.yToken.address, newCollateralizationRatioMantissa),
        ).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });
  });

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.fintroller
          .connect(this.eve)
          .setCollateralizationRatio(this.yToken.address, this.scenario.fintroller.collateralizationRatio),
      ).to.be.revertedWith(Errors.NotAuthorized);
    });
  });
}
