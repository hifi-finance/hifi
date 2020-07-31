import chai from "chai";
import { Wallet } from "@ethersproject/wallet";
import { ethers } from "@nomiclabs/buidler";
import { solidity } from "ethereum-waffle";

import scenarios from "./scenarios";
import { testFintroller } from "./fintroller/Fintroller";
import { testYToken } from "./yToken/YToken";

chai.use(solidity);

setTimeout(async function () {
  const wallets = (await ethers.getSigners()) as Wallet[];

  before(async function () {
    this.scenario = scenarios.default;
  });

  testFintroller(wallets);
  testYToken(wallets);

  run();
}, 1000);
