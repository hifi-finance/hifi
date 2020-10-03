import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { Signer } from "@ethersproject/abstract-signer";
import { expect } from "chai";
import { waffle } from "@nomiclabs/buidler";

import YTokenArtifact from "../../../../artifacts/YToken.json";

import { YTokenConstants } from "../../../../utils/constants";
import { YTokenErrors } from "../../../../utils/errors";

const { deployContract } = waffle;

const name: string = "DAI/ETH (2021-01-01)";
const symbol: string = "yDAI-JAN21";
const expirationTime: BigNumber = YTokenConstants.DefaultExpirationTime; /* December 31, 2020 at 23:59:59 */

function createDeployYTokenPromise(this: Mocha.Context): Promise<Contract> {
  const deployer: Signer = this.signers.admin;
  const deployYTokenPromise: Promise<Contract> = deployContract(deployer, YTokenArtifact, [
    name,
    symbol,
    expirationTime,
    this.stubs.fintroller.address,
    this.stubs.balanceSheet.address,
    this.stubs.underlying.address,
    this.stubs.collateral.address,
    this.stubs.redemptionPool.address,
  ]);
  return deployYTokenPromise;
}

export default function shouldBehaveLikeConstructor(): void {
  describe("when the underlying has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(BigNumber.from(36));
    });

    it("reverts", async function () {
      const deployYTokenPromise: Promise<Contract> = createDeployYTokenPromise.call(this);
      await expect(deployYTokenPromise).to.be.revertedWith(YTokenErrors.ConstructorUnderlyingDecimalsOverflow);
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
