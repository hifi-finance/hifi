import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { Signer } from "@ethersproject/abstract-signer";
import { expect } from "chai";
import { waffle } from "@nomiclabs/buidler";

import GuarantorPoolArtifact from "../../../../artifacts/GuarantorPool.json";

import { GuarantorPoolErrors } from "../../../helpers/errors";

const { deployContract } = waffle;

const name: string = "Mainframe Guarantor Shares V1";
const symbol: string = "MGS-V1";

function createDeployGuarantorPoolPromise(this: Mocha.Context): Promise<Contract> {
  const deployer: Signer = this.signers.admin;
  const deployGuarantorPoolPromise: Promise<Contract> = deployContract(deployer, GuarantorPoolArtifact, [
    name,
    symbol,
    this.stubs.fintroller.address,
    this.stubs.yToken.address,
    this.stubs.guaranty.address,
  ]);
  return deployGuarantorPoolPromise;
}

export default function shouldBehaveLikeConstructor(): void {
  describe("when the guaranty has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.guaranty.mock.decimals.returns(BigNumber.from(36));
    });

    it("reverts", async function () {
      const deployGuarantorPoolPromise: Promise<Contract> = createDeployGuarantorPoolPromise.call(this);
      await expect(deployGuarantorPoolPromise).to.be.revertedWith(
        GuarantorPoolErrors.ConstructorGuarantyDecimalsOverflow,
      );
    });
  });
}
