import chai from "chai";
import { Signer } from "@ethersproject/abstract-signer";
import { ethers } from "@nomiclabs/buidler";
import { solidity } from "ethereum-waffle";

import scenarios from "./scenarios";
import { testFintroller } from "./units/fintroller/Fintroller";
import { testYToken } from "./units/yToken/YToken";

chai.use(solidity);

describe("Contracts", function () {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let snapshot: any;

  before(async function () {
    snapshot = await ethers.provider.send("evm_snapshot", []);
  });

  before(async function () {
    this.scenario = scenarios.default;
    const signers: Signer[] = await ethers.getSigners();

    this.admin = signers[0];
    this.brad = signers[1];
    this.grace = signers[2];
    this.lucy = signers[3];
    this.eve = signers[4];

    this.adminAddress = await signers[0].getAddress();
    this.bradAddress = await signers[1].getAddress();
    this.graceAddress = await signers[2].getAddress();
    this.lucyAddress = await signers[3].getAddress();
    this.eveAddress = await signers[4].getAddress();
  });

  testFintroller();
  testYToken();

  after(async function () {
    await ethers.provider.send("evm_revert", [snapshot]);
  });
});
