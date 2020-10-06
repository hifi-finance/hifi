import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { AdminErrors, FintrollerErrors } from "../../../../utils/errors";
import { FintrollerConstants, OnePercentMantissa } from "../../../../utils/constants";

export default function shouldBehaveLikeSetCollateralizationRatio(): void {
  /* Equivalent to 175% */
  const newCollateralizationRatioMantissa: BigNumber = OnePercentMantissa.mul(175);

  describe("when the caller is the admin", function () {
    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
      });

      describe("when the collateralization ratio is valid", function () {
        it("sets the new collateralization ratio", async function () {
          await this.contracts.fintroller
            .connect(this.signers.admin)
            .setCollateralizationRatio(this.stubs.yToken.address, newCollateralizationRatioMantissa);
          const contractCollateralizationRatioMantissa: BigNumber = await this.contracts.fintroller.getBondCollateralizationRatio(
            this.stubs.yToken.address,
          );
          expect(contractCollateralizationRatioMantissa).to.equal(newCollateralizationRatioMantissa);
        });

        it("emits a SetCollateralizationRatio event", async function () {
          await expect(
            this.contracts.fintroller
              .connect(this.signers.admin)
              .setCollateralizationRatio(this.stubs.yToken.address, newCollateralizationRatioMantissa),
          )
            .to.emit(this.contracts.fintroller, "SetCollateralizationRatio")
            .withArgs(
              this.accounts.admin,
              this.stubs.yToken.address,
              FintrollerConstants.DefaultCollateralizationRatioMantissa,
              newCollateralizationRatioMantissa,
            );
        });
      });

      describe("when the value of the collateralization ratio is not valid", function () {
        describe("when the collateralization ratio is higher than 10,000%", function () {
          it("reverts", async function () {
            const overflowCollateralizationRatioMantissa: BigNumber = OnePercentMantissa.mul(10000).add(1);
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setCollateralizationRatio(this.stubs.yToken.address, overflowCollateralizationRatioMantissa),
            ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioOverflow);
          });
        });

        describe("when the collateralization ratio is lower than 100%", function () {
          it("reverts", async function () {
            const underflowCollateralizationRatioMantissa: BigNumber = OnePercentMantissa.mul(100).sub(1);
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setCollateralizationRatio(this.stubs.yToken.address, underflowCollateralizationRatioMantissa),
            ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioUnderflow);
          });
        });

        describe("when the collateralization ratio is zero", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setCollateralizationRatio(this.stubs.yToken.address, Zero),
            ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioUnderflow);
          });
        });
      });
    });

    describe("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setCollateralizationRatio(this.stubs.yToken.address, newCollateralizationRatioMantissa),
        ).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });
  });

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.eve)
          .setCollateralizationRatio(this.stubs.yToken.address, newCollateralizationRatioMantissa),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });
}
