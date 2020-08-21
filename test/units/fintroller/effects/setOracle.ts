import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

import { AddressOne } from "../../../helpers/constants";
import { Errors, FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeSetOracle(): void {
  const newOracle: string = AddressOne;

  describe("when the caller is the admin", function () {
    describe("when oracle address is not the zero address", function () {
      it("sets the new value", async function () {
        /* TODO: replace this with a proper oracle address */
        await this.contracts.fintroller.connect(this.signers.admin).setOracle(newOracle);
      });

      it("emits a NewOracle event", async function () {
        /* The first argument is the zero address because initially there's no oracle */
        await expect(this.contracts.fintroller.connect(this.signers.admin).setOracle(newOracle))
          .to.emit(this.contracts.fintroller, "NewOracle")
          .withArgs(AddressZero, newOracle);
      });
    });

    describe("when the oracle address is the zero address", function () {
      it("reverts", async function () {
        await expect(this.contracts.fintroller.connect(this.signers.admin).setOracle(AddressZero)).to.be.revertedWith(
          FintrollerErrors.SetOracleZeroAddress,
        );
      });
    });
  });

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.connect(this.signers.eve).setOracle(AddressZero)).to.be.revertedWith(
        Errors.NotAuthorized,
      );
    });
  });
}
