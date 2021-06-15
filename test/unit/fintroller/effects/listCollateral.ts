import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { bn } from "../../../../helpers/numbers";
import { FintrollerErrors, OwnableErrors } from "../../../shared/errors";

export default function shouldBehaveLikeListCollateral(): void {
  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.raider).listCollateral(this.mocks.wbtc.address),
      ).to.be.revertedWith(OwnableErrors.NotOwner);
    });
  });

  context("when the caller is the owner", function () {
    context("when the number of decimals is out of bounds", function () {
      context("when the number of decimals is 0", function () {
        beforeEach(async function () {
          await this.mocks.wbtc.mock.decimals.returns(Zero);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.fintroller.connect(this.signers.owner).listCollateral(this.mocks.wbtc.address),
          ).to.be.revertedWith(FintrollerErrors.ListCollateralDecimalsZero);
        });
      });

      context("when the number of decimals is 36", function () {
        beforeEach(async function () {
          await this.mocks.wbtc.mock.decimals.returns(bn("36"));
        });

        it("reverts", async function () {
          await expect(
            this.contracts.fintroller.connect(this.signers.owner).listCollateral(this.mocks.wbtc.address),
          ).to.be.revertedWith(FintrollerErrors.ListCollateralDecimalsOverflow);
        });
      });
    });

    context("when the number of decimals is not out of bounds", function () {
      it("lists the collateral", async function () {
        await this.contracts.fintroller.connect(this.signers.owner).listCollateral(this.mocks.wbtc.address);
        const collateral = await this.contracts.fintroller.getCollateral(this.mocks.wbtc.address);
        expect(collateral.isListed).to.equal(true);
      });

      it("emits a ListCollateral event", async function () {
        await expect(this.contracts.fintroller.connect(this.signers.owner).listCollateral(this.mocks.wbtc.address))
          .to.emit(this.contracts.fintroller, "ListCollateral")
          .withArgs(this.signers.owner.address, this.mocks.wbtc.address);
      });
    });
  });
}
