import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { GuarantorPoolErrors } from "../../../helpers/errors";
import { OneHundredTokens } from "../../../helpers/constants";

export default function shouldBehaveLikeAddLiquidity(): void {
  const liquidityAmount: BigNumber = OneHundredTokens;

  describe.only("when the amount to add is non-zero", function () {
    beforeEach(async function () {
      /* The Guarantor Pool makes an internal call to this stubbed functions. */
      await this.stubs.asset.mock.transferFrom
        .withArgs(this.accounts.grace, this.contracts.guarantorPool.address, liquidityAmount)
        .returns(true);
    });

    it("adds liquidity", async function () {
      /* TODO: check for balances. */
      await this.contracts.guarantorPool.connect(this.signers.grace).addLiquidity(liquidityAmount);
    });
  });

  describe("when the amount to add is zero", function () {
    it("reverts", async function () {
      await expect(this.contracts.guarantorPool.connect(this.signers.grace).addLiquidity(Zero)).to.be.revertedWith(
        GuarantorPoolErrors.AddLiquidityZero,
      );
    });
  });
}
