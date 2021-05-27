import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { hTokenConstants } from "../../../../helpers/constants";
import { HTokenErrors } from "../../../../helpers/errors";
import { getNow } from "../../../../helpers/time";
import { HToken } from "../../../../typechain/HToken";
import { deployHToken } from "../../../deployers";

export default function shouldBehaveLikeConstructor(): void {
  const thirtySixDecimals: BigNumber = BigNumber.from(36);

  describe("when the underlying has zero decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(Zero);
    });

    it("reverts", async function () {
      const deployHTokenPromise: Promise<HToken> = deployHToken(
        this.signers.admin,
        hTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployHTokenPromise).to.be.revertedWith(HTokenErrors.ConstructorUnderlyingDecimalsZero);
    });
  });

  describe("when the underlying has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(thirtySixDecimals);
    });

    it("reverts", async function () {
      const deployHTokenPromise: Promise<HToken> = deployHToken(
        this.signers.admin,
        hTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployHTokenPromise).to.be.revertedWith(HTokenErrors.ConstructorUnderlyingDecimalsOverflow);
    });
  });

  describe("when the collateral has zero decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(Zero);
    });

    it("reverts", async function () {
      const deployHTokenPromise: Promise<HToken> = deployHToken(
        this.signers.admin,
        hTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployHTokenPromise).to.be.revertedWith(HTokenErrors.ConstructorCollateralDecimalsZero);
    });
  });

  describe("when the collateral has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(BigNumber.from(36));
    });

    it("reverts", async function () {
      const deployHTokenPromise: Promise<HToken> = deployHToken(
        this.signers.admin,
        hTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployHTokenPromise).to.be.revertedWith(HTokenErrors.ConstructorCollateralDecimalsOverflow);
    });
  });

  describe("when the expiration time is in the past", function () {
    it("reverts", async function () {
      const nowMinusOneHour: BigNumber = getNow().sub(3600);
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
