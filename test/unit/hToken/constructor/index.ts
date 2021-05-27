import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { H_TOKEN_EXPIRATION_TIME } from "../../../../helpers/constants";
import { HTokenErrors } from "../../../../helpers/errors";
import { bn } from "../../../../helpers/numbers";
import { now } from "../../../../helpers/time";
import { HToken } from "../../../../typechain/HToken";
import { deployHToken } from "../../../deployers";

export default function shouldBehaveLikeConstructor(): void {
  context("when the underlying has zero decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(Zero);
    });

    it("reverts", async function () {
      const deployHTokenPromise: Promise<HToken> = deployHToken(
        this.signers.admin,
        H_TOKEN_EXPIRATION_TIME,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployHTokenPromise).to.be.revertedWith(HTokenErrors.ConstructorUnderlyingDecimalsZero);
    });
  });

  context("when the underlying has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(bn("36"));
    });

    it("reverts", async function () {
      const deployHTokenPromise: Promise<HToken> = deployHToken(
        this.signers.admin,
        H_TOKEN_EXPIRATION_TIME,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployHTokenPromise).to.be.revertedWith(HTokenErrors.ConstructorUnderlyingDecimalsOverflow);
    });
  });

  context("when the collateral has zero decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(Zero);
    });

    it("reverts", async function () {
      const deployHTokenPromise: Promise<HToken> = deployHToken(
        this.signers.admin,
        H_TOKEN_EXPIRATION_TIME,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployHTokenPromise).to.be.revertedWith(HTokenErrors.ConstructorCollateralDecimalsZero);
    });
  });

  context("when the collateral has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(bn("36"));
    });

    it("reverts", async function () {
      const deployHTokenPromise: Promise<HToken> = deployHToken(
        this.signers.admin,
        H_TOKEN_EXPIRATION_TIME,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployHTokenPromise).to.be.revertedWith(HTokenErrors.ConstructorCollateralDecimalsOverflow);
    });
  });

  context("when the expiration time is in the past", function () {
    it("reverts", async function () {
      const nowMinusOneHour: BigNumber = now().sub(3600);
      const deployHTokenPromise: Promise<HToken> = deployHToken(
        this.signers.admin,
        nowMinusOneHour,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployHTokenPromise).to.be.revertedWith(HTokenErrors.ConstructorExpirationTimeNotValid);
    });
  });
}
