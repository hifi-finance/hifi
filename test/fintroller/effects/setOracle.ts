import { Wallet } from "@ethersproject/wallet";
import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

import { AddressOne } from "../../constants";
import { Errors, FintrollerErrors } from "../../errors";

export default function shouldBehaveLikeSetOracle(alice: Wallet, eve: Wallet): void {
  describe("when the caller is the admin", function () {
    describe("when oracle address is not the zero address", function () {
      it("sets the new value", async function () {
        /* TODO: replace this with a proper oracle address */
        await this.fintroller.setOracle(AddressOne);
      });
    });

    describe("when the oracle address is the zero address", function () {
      it("reverts", async function () {
        await expect(this.fintroller.setOracle(AddressZero)).to.be.revertedWith(FintrollerErrors.SetOracleZeroAddress);
      });
    });
  });

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(this.fintroller.connect(eve).setOracle(AddressZero)).to.be.revertedWith(Errors.NotAuthorized);
    });
  });
}
