import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetVaultLockedCollateral(): void {
  describe("when the bond is not open", function () {
    it("retrieves the default value", async function () {
      const lockedCollateral: BigNumber = await this.contracts.balanceSheet.getVaultLockedCollateral(
        this.stubs.hToken.address,
        this.signers.borrower.address,
      );
      expect(lockedCollateral).to.equal(Zero);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.isBondListed.withArgs(this.stubs.hToken.address).returns(true);
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.hToken.address);
    });

    it("retrieves the default value", async function () {
      const lockedCollateral: BigNumber = await this.contracts.balanceSheet.getVaultLockedCollateral(
        this.stubs.hToken.address,
        this.signers.borrower.address,
      );
      expect(lockedCollateral).to.equal(Zero);
    });
  });
}
