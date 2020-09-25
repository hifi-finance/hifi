import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { GuarantorPoolErrors } from "../../../helpers/errors";
import { MinimumGuarantorPoolLiquidity, OneHundredTokens } from "../../../helpers/constants";

export default function shouldBehaveLikeAddLiquidity(): void {
  const liquidityAmount: BigNumber = OneHundredTokens;
  const mintedShares = liquidityAmount.sub(MinimumGuarantorPoolLiquidity);

  describe.only("when the amount of liquidity to add is non-zero", function () {
    beforeEach(async function () {
      /* The Guarantor Pool makes an internal call to this stubbed function. */
      await this.stubs.asset.mock.transferFrom
        .withArgs(this.accounts.grace, this.contracts.guarantorPool.address, liquidityAmount)
        .returns(true);
    });

    describe("when the total supply of shares is zero", function () {
      it("adds liquidity", async function () {
        const preBalance: BigNumber = await this.contracts.guarantorPool.balanceOf(this.accounts.grace);
        await this.contracts.guarantorPool.connect(this.signers.grace).addLiquidity(liquidityAmount);
        const postBalance: BigNumber = await this.contracts.guarantorPool.balanceOf(this.accounts.grace);

        /* The first guarantor's number of shares is the liquidity amount, upscaled to 18 decimals, minus 1e-15. */
        expect(preBalance).to.equal(postBalance.sub(mintedShares));
      });

      it("emits an AddLiquidity event", async function () {
        await expect(this.contracts.guarantorPool.connect(this.signers.grace).addLiquidity(liquidityAmount))
          .to.emit(this.contracts.guarantorPool, "AddLiquidity")
          .withArgs(this.accounts.grace, liquidityAmount);
      });

      it("emits a Mint event", async function () {
        await expect(this.contracts.guarantorPool.connect(this.signers.grace).addLiquidity(liquidityAmount))
          .to.emit(this.contracts.guarantorPool, "Mint")
          .withArgs(this.accounts.grace, mintedShares);
      });
    });

    // describe("when the total supply of shares is non-zero", function() {

    // });
  });

  describe("when the amount of liquidity to add is zero", function () {
    it("reverts", async function () {
      await expect(this.contracts.guarantorPool.connect(this.signers.grace).addLiquidity(Zero)).to.be.revertedWith(
        GuarantorPoolErrors.AddLiquidityZero,
      );
    });
  });
}
