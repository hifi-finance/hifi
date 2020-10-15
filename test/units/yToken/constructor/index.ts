import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { Signer } from "@ethersproject/abstract-signer";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import { waffle } from "@nomiclabs/buidler";

import YTokenArtifact from "../../../../artifacts/YToken.json";

import { YTokenConstants } from "../../../../helpers/constants";
import { YTokenErrors } from "../../../../helpers/errors";

const { deployContract } = waffle;

function createDeployYTokenPromise(this: Mocha.Context): Promise<Contract> {
  const deployer: Signer = this.signers.admin;
  const deployYTokenPromise: Promise<Contract> = deployContract(deployer, YTokenArtifact, [
    YTokenConstants.Name,
    YTokenConstants.Symbol,
    YTokenConstants.DefaultExpirationTime,
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
      await expect(deployYTokenPromise).to.be.revertedWith(YTokenErrors.ConstructorUnderlyingDecimalsZero);
    });
  });

  describe("when the underlying has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(thirtySixDecimals);
    });

    it("reverts", async function () {
      const deployYTokenPromise: Promise<Contract> = createDeployYTokenPromise.call(this);
      await expect(deployYTokenPromise).to.be.revertedWith(YTokenErrors.ConstructorUnderlyingDecimalsOverflow);
    });
  });

  describe("when the collateral has zero decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(Zero);
    });

    it("reverts", async function () {
      const deployYTokenPromise: Promise<Contract> = createDeployYTokenPromise.call(this);
      await expect(deployYTokenPromise).to.be.revertedWith(YTokenErrors.ConstructorCollateralDecimalsZero);
    });
  });

  describe("when the collateral has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(BigNumber.from(36));
    });

    it("reverts", async function () {
      const deployYTokenPromise: Promise<Contract> = createDeployYTokenPromise.call(this);
      await expect(deployYTokenPromise).to.be.revertedWith(YTokenErrors.ConstructorCollateralDecimalsOverflow);
    });
  });
}
