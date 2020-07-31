import { Wallet } from "@ethersproject/wallet";
import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

import { Errors } from "../../errors";

export default function shouldBehaveLikeSetOracle(alice: Wallet, eve: Wallet): void {
  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(this.fintroller.connect(eve).setOracle(AddressZero)).to.be.revertedWith(Errors.NotAuthorized);
    });
  });
}
