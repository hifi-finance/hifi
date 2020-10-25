import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FyTokenErrors } from "../../../../helpers/errors";
import { FyToken } from "../../../../typechain/FyToken";
import { deployFyToken } from "../../../deployers";
import { getNow } from "../../../../helpers/time";
import { fyTokenConstants } from "../../../../helpers/constants";

export default function shouldBehaveLikeConstructor(): void {
  const thirtySixDecimals: BigNumber = BigNumber.from(36);

  describe("when the underlying has zero decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(Zero);
    });

    it("reverts", async function () {
      const deployFyTokenPromise: Promise<FyToken> = deployFyToken(
        this.signers.admin,
        fyTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployFyTokenPromise).to.be.revertedWith(FyTokenErrors.ConstructorUnderlyingDecimalsZero);
    });
  });

  describe("when the underlying has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(thirtySixDecimals);
    });

    it("reverts", async function () {
      const deployFyTokenPromise: Promise<FyToken> = deployFyToken(
        this.signers.admin,
        fyTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployFyTokenPromise).to.be.revertedWith(FyTokenErrors.ConstructorUnderlyingDecimalsOverflow);
    });
  });

  describe("when the collateral has zero decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(Zero);
    });

    it("reverts", async function () {
      const deployFyTokenPromise: Promise<FyToken> = deployFyToken(
        this.signers.admin,
        fyTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployFyTokenPromise).to.be.revertedWith(FyTokenErrors.ConstructorCollateralDecimalsZero);
    });
  });

  describe("when the collateral has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(BigNumber.from(36));
    });

    it("reverts", async function () {
      const deployFyTokenPromise: Promise<FyToken> = deployFyToken(
        this.signers.admin,
        fyTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployFyTokenPromise).to.be.revertedWith(FyTokenErrors.ConstructorCollateralDecimalsOverflow);
    });
  });

  describe("when the expiration time is in the past", function () {
    it("reverts", async function () {
      const nowMinusOneHour: BigNumber = getNow().sub(3600);
      const deployFyTokenPromise: Promise<FyToken> = deployFyToken(
        this.signers.admin,
        nowMinusOneHour,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      await expect(deployFyTokenPromise).to.be.revertedWith(FyTokenErrors.ConstructorExpirationTimeNotValid);
    });
  });
}
