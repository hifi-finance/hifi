import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { H_TOKEN_MATURITIES } from "../../../../helpers/constants";
import { bn } from "../../../../helpers/numbers";
import { now } from "../../../../helpers/time";
import { HToken } from "../../../../typechain/HToken";
import { deployHToken } from "../../../shared/deployers";
import { HTokenErrors } from "../../../shared/errors";

export default function shouldBehaveLikeConstructor(): void {
  context("when the underlying has zero decimals", function () {
    beforeEach(async function () {
      await this.mocks.usdc.mock.decimals.returns(Zero);
    });

    it("reverts", async function () {
      const deployHTokenPromise: Promise<HToken> = deployHToken(
        this.signers.admin,
        H_TOKEN_MATURITIES[0],
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      await expect(deployHTokenPromise).to.be.revertedWith(HTokenErrors.UnderlyingDecimalsZero);
    });
  });

  context("when the underlying has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.mocks.usdc.mock.decimals.returns(bn("36"));
    });

    it("reverts", async function () {
      const deployHTokenPromise: Promise<HToken> = deployHToken(
        this.signers.admin,
        H_TOKEN_MATURITIES[0],
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      await expect(deployHTokenPromise).to.be.revertedWith(HTokenErrors.UnderlyingDecimalsOverflow);
    });
  });

  context("when the maturity is in the past", function () {
    it("reverts", async function () {
      const oneHourAgo: BigNumber = now().sub(3600);
      const deployHTokenPromise: Promise<HToken> = deployHToken(
        this.signers.admin,
        oneHourAgo,
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      await expect(deployHTokenPromise).to.be.revertedWith(HTokenErrors.MaturityPast);
    });
  });
}
