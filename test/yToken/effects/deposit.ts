import { BigNumber } from "@ethersproject/bignumber";
import { Wallet } from "@ethersproject/wallet";
import { expect } from "chai";

export default function shouldBehaveLikeDeposit(admin: Wallet, bob: Wallet, _eve: Wallet): void {
  // describe("when the vault is open", function () {});

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      const someNumber: BigNumber = BigNumber.from(100);
      await expect(this.yToken.connect(bob).deposit(someNumber)).to.be.revertedWith("LOL");
    });
  });
}
