import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { GuarantorPoolErrors } from "../../../helpers/errors";
import { MinimumGuarantorPoolShares, OneHundredTokens } from "../../../helpers/constants";

export default function shouldBehaveLikeDepositGuaranty(): void {
  const guarantyAmount: BigNumber = OneHundredTokens;
  const mintedShares = guarantyAmount.sub(MinimumGuarantorPoolShares);

  describe.only("when the amount to deposit is non-zero", function () {
    beforeEach(async function () {
      /* The Guarantor Pool makes an internal call to this stubbed function. */
      await this.stubs.asset.mock.transferFrom
        .withArgs(this.accounts.grace, this.contracts.guarantorPool.address, guarantyAmount)
        .returns(true);
    });

    describe("when the total supply of shares is zero", function () {
      it("deposits the guaranty", async function () {
        const preBalance: BigNumber = await this.contracts.guarantorPool.balanceOf(this.accounts.grace);
        await this.contracts.guarantorPool.connect(this.signers.grace).depositGuaranty(guarantyAmount);
        const postBalance: BigNumber = await this.contracts.guarantorPool.balanceOf(this.accounts.grace);

        /* The first guarantor's number of shares is the liquidity amount, upscaled to 18 decimals, minus 1e-15. */
        expect(preBalance).to.equal(postBalance.sub(mintedShares));
      });

      it("emits a DepositGuaranty event", async function () {
        await expect(this.contracts.guarantorPool.connect(this.signers.grace).depositGuaranty(guarantyAmount))
          .to.emit(this.contracts.guarantorPool, "DepositGuaranty")
          .withArgs(this.accounts.grace, guarantyAmount);
      });

      it("emits a Mint event", async function () {
        await expect(this.contracts.guarantorPool.connect(this.signers.grace).depositGuaranty(guarantyAmount))
          .to.emit(this.contracts.guarantorPool, "Mint")
          .withArgs(this.accounts.grace, mintedShares);
      });
    });

    // describe("when the total supply of shares is non-zero", function() {

    // });
  });

  describe("when the amount to deposit is zero", function () {
    it("reverts", async function () {
      await expect(this.contracts.guarantorPool.connect(this.signers.grace).depositGuaranty(Zero)).to.be.revertedWith(
        GuarantorPoolErrors.DepositGuarantyZero,
      );
    });
  });
}
