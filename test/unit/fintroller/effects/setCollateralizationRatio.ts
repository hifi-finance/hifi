import { BigNumber } from "@ethersproject/bignumber";
import { One, Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { AdminErrors, FintrollerErrors } from "../../../../helpers/errors";
import { fintrollerConstants, percentages } from "../../../../helpers/constants";

export default function shouldBehaveLikeSetCollateralizationRatio(): void {
  const newCollateralizationRatioMantissa: BigNumber = percentages.oneHundredAndSeventyFive;
  const overflowCollateralizationRatioMantissa: BigNumber = fintrollerConstants.collateralizationRatioUpperBoundMantissa.add(
    One,
  );
  const underflowCollateralizationRatioMantissa: BigNumber = fintrollerConstants.collateralizationRatioLowerBoundMantissa.sub(
    One,
  );

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setCollateralizationRatio(this.stubs.fyToken.address, newCollateralizationRatioMantissa),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  describe("when the caller is the admin", function () {
    describe("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setCollateralizationRatio(this.stubs.fyToken.address, newCollateralizationRatioMantissa),
        ).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });

    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.fyToken.address);
      });

      describe("when the collateralization ratio is not valid", function () {
        describe("when the collateralization ratio is higher than 10,000%", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setCollateralizationRatio(this.stubs.fyToken.address, overflowCollateralizationRatioMantissa),
            ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioUpperBound);
          });
        });

        describe("when the collateralization ratio is lower than 100%", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setCollateralizationRatio(this.stubs.fyToken.address, underflowCollateralizationRatioMantissa),
            ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioLowerBound);
          });
        });

        describe("when the collateralization ratio is zero", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setCollateralizationRatio(this.stubs.fyToken.address, Zero),
            ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioLowerBound);
          });
        });
      });

      describe("when the collateralization ratio is valid", function () {
        it("sets the new collateralization ratio", async function () {
          await this.contracts.fintroller
            .connect(this.signers.admin)
            .setCollateralizationRatio(this.stubs.fyToken.address, newCollateralizationRatioMantissa);
          const contractCollateralizationRatioMantissa: BigNumber = await this.contracts.fintroller.getBondCollateralizationRatio(
            this.stubs.fyToken.address,
          );
          expect(contractCollateralizationRatioMantissa).to.equal(newCollateralizationRatioMantissa);
        });

        it("emits a SetCollateralizationRatio event", async function () {
          await expect(
            this.contracts.fintroller
              .connect(this.signers.admin)
              .setCollateralizationRatio(this.stubs.fyToken.address, newCollateralizationRatioMantissa),
          )
            .to.emit(this.contracts.fintroller, "SetCollateralizationRatio")
            .withArgs(
              this.accounts.admin,
              this.stubs.fyToken.address,
              fintrollerConstants.defaultCollateralizationRatio,
              newCollateralizationRatioMantissa,
            );
        });
      });
    });
  });
}
