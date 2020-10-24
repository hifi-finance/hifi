import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { Signer } from "@ethersproject/abstract-signer";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import { waffle } from "@nomiclabs/buidler";

import FyTokenArtifact from "../../../../artifacts/FyToken.json";

import { fyTokenConstants } from "../../../../helpers/constants";
import { FyTokenErrors } from "../../../../helpers/errors";
import { getNow } from "../../../../helpers/time";

const { deployContract } = waffle;

function createDeployYTokenPromise(this: Mocha.Context, expirationTime?: BigNumber): Promise<Contract> {
  const deployer: Signer = this.signers.admin;
  const deployYTokenPromise: Promise<Contract> = deployContract(deployer, FyTokenArtifact, [
    fyTokenConstants.name,
    fyTokenConstants.symbol,
    expirationTime || fyTokenConstants.expirationTime,
    this.stubs.fintroller.address,
    this.stubs.balanceSheet.address,
    this.stubs.underlying.address,
    this.stubs.collateral.address,
  ]);
  return deployYTokenPromise;
}

export default function shouldBehaveLikeConstructor(): void {
  const thirtySixDecimals: BigNumber = BigNumber.from(36);

  describe("when the underlying has zero decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(Zero);
    });

    it("reverts", async function () {
      const deployYTokenPromise: Promise<Contract> = createDeployYTokenPromise.call(this);
      await expect(deployYTokenPromise).to.be.revertedWith(FyTokenErrors.ConstructorUnderlyingDecimalsZero);
    });
  });

  describe("when the underlying has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(thirtySixDecimals);
    });

    it("reverts", async function () {
      const deployYTokenPromise: Promise<Contract> = createDeployYTokenPromise.call(this);
      await expect(deployYTokenPromise).to.be.revertedWith(FyTokenErrors.ConstructorUnderlyingDecimalsOverflow);
    });
  });

  describe("when the collateral has zero decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(Zero);
    });

    it("reverts", async function () {
      const deployYTokenPromise: Promise<Contract> = createDeployYTokenPromise.call(this);
      await expect(deployYTokenPromise).to.be.revertedWith(FyTokenErrors.ConstructorCollateralDecimalsZero);
    });
  });

  describe("when the collateral has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(BigNumber.from(36));
    });

    it("reverts", async function () {
      const deployYTokenPromise: Promise<Contract> = createDeployYTokenPromise.call(this);
      await expect(deployYTokenPromise).to.be.revertedWith(FyTokenErrors.ConstructorCollateralDecimalsOverflow);
    });
  });

  describe("when the expiration time is in the past", function () {
    it("reverts", async function () {
      const nowMinusOneHour: BigNumber = getNow().sub(3600);
      const deployYTokenPromise: Promise<Contract> = createDeployYTokenPromise.call(this, nowMinusOneHour);
      await expect(deployYTokenPromise).to.be.revertedWith(FyTokenErrors.ConstructorExpirationTimeNotValid);
    });
  });
}
