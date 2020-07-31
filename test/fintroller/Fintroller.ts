import { Wallet } from "@ethersproject/wallet";
import { deployContract } from "ethereum-waffle";

import FintrollerArtifact from "../../artifacts/Fintroller.json";

import { Fintroller } from "../../typechain/Fintroller";
import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";
import { shouldBehaveLikeFintrollerStorage } from "./FintrollerStorage.behavior";

export function testFintroller(wallets: Wallet[]): void {
  describe("Fintroller Tests", function () {
    beforeEach(async function () {
      const deployer: Wallet = wallets[0];
      this.fintroller = (await deployContract(deployer, FintrollerArtifact, [])) as Fintroller;
    });

    describe("Fintroller", function () {
      shouldBehaveLikeFintroller(wallets);
    });

    describe("FintrollerStorage", function () {
      shouldBehaveLikeFintrollerStorage(wallets);
    });
  });
}
