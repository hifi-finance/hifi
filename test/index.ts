import { Wallet } from "@ethersproject/wallet";
import { ethers } from "@nomiclabs/buidler";

import { testFintroller } from "./fintroller/Fintroller";
import { testYToken } from "./yToken/YToken";

setTimeout(async function () {
  const wallets = (await ethers.getSigners()) as Wallet[];

  testFintroller(wallets);
  testYToken(wallets);

  run();
}, 1000);
