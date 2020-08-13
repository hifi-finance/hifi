import chai from "chai";
import { Signer } from "@ethersproject/abstract-signer";
import { ethers } from "@nomiclabs/buidler";
import { solidity } from "ethereum-waffle";

import scenarios from "../scenarios";
import { testFintroller } from "./fintroller/Fintroller";
import { testYToken } from "./yToken/YToken";

chai.use(solidity);

describe("Contracts", function () {
  before(async function () {
    this.scenario = scenarios.default;

    const signers: Signer[] = await ethers.getSigners();
    this.admin = signers[0];
    this.brad = signers[1];
    this.grace = signers[2];
    this.lucy = signers[3];
    this.eve = signers[4];
  });

  testFintroller();
  testYToken();
});
