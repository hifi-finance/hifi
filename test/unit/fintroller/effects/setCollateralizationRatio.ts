import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import {
  COLLATERALIZATION_RATIO_LOWER_BOUND,
  COLLATERALIZATION_RATIO_UPPER_BOUND,
  DEFAULT_COLLATERALIZATION_RATIO,
} from "../../../../helpers/constants";
import { AdminErrors, FintrollerErrors, GenericErrors } from "../../../../helpers/errors";
import { bn } from "../../../../helpers/numbers";

export default function shouldBehaveLikeSetCollateralizationRatio(): void {
  const newCollateralizationRatio: BigNumber = fp("1.75");
  const overflowCollateralizationRatio: BigNumber = COLLATERALIZATION_RATIO_UPPER_BOUND.add(bn("1"));
  const underflowCollateralizationRatio: BigNumber = COLLATERALIZATION_RATIO_LOWER_BOUND.sub(bn("1"));

  context("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setCollateralizationRatio(this.mocks.wbtc.address, newCollateralizationRatio),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  context("when the caller is the admin", function () {
    context("when the collateral is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setCollateralizationRatio(this.mocks.wbtc.address, newCollateralizationRatio),
        ).to.be.revertedWith(GenericErrors.CollateralNotListed);
      });
    });

    context("when the collateral is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.mocks.wbtc.address);
      });

      context("when the collateralization ratio is not valid", function () {
        context("when the collateralization ratio is higher than 10,000%", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setCollateralizationRatio(this.mocks.wbtc.address, overflowCollateralizationRatio),
            ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioUpperBound);
          });
        });

        context("when the collateralization ratio is lower than 100%", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setCollateralizationRatio(this.mocks.wbtc.address, underflowCollateralizationRatio),
            ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioLowerBound);
          });
        });

        context("when the collateralization ratio is zero", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setCollateralizationRatio(this.mocks.wbtc.address, Zero),
            ).to.be.revertedWith(FintrollerErrors.SetCollateralizationRatioLowerBound);
          });
        });
      });

      context("when the collateralization ratio is valid", function () {
        it("sets the new collateralization ratio", async function () {
          await this.contracts.fintroller
            .connect(this.signers.admin)
            .setCollateralizationRatio(this.mocks.wbtc.address, newCollateralizationRatio);
          const contractCollateralizationRatio: BigNumber = await this.contracts.fintroller.getCollateralizationRatio(
            this.mocks.wbtc.address,
          );
          expect(contractCollateralizationRatio).to.equal(newCollateralizationRatio);
        });

        it("emits a SetBondCollateralizationRatio event", async function () {
          await expect(
            this.contracts.fintroller
              .connect(this.signers.admin)
              .setCollateralizationRatio(this.mocks.wbtc.address, newCollateralizationRatio),
          )
            .to.emit(this.contracts.fintroller, "SetCollateralizationRatio")
            .withArgs(
              this.signers.admin.address,
              this.mocks.wbtc.address,
              DEFAULT_COLLATERALIZATION_RATIO,
              newCollateralizationRatio,
            );
        });
      });
    });
  });
}
