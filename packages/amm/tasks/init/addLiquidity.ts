import { BigNumber } from "@ethersproject/bignumber";
import { MaxUint256 } from "@ethersproject/constants";
import type { HToken } from "@hifi/protocol/dist/types/HToken";
import { HToken__factory } from "@hifi/protocol/dist/types/factories/HToken__factory";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { Erc20 } from "../../src/types/Erc20";
import type { HifiPool } from "../../src/types/HifiPool";
import { Erc20__factory } from "../../src/types/factories/Erc20__factory";
import { HifiPool__factory } from "../../src/types/factories/HifiPool__factory";
import { TASK_INIT_ADD_LIQUIDITY } from "../constants";

task(TASK_INIT_ADD_LIQUIDITY)
  // Contract arguments
  .addParam("hifiPool", "Address of the HifiPool contract")
  .addParam("poolUnderlyingAmount", "Amount of underlying to add as liquidity in the pool")
  .addParam("depositUnderlyingAmount", "Amount of underlying to supply in exchange for hTokens")
  // Developer settings
  .addOptionalParam("printTxHashes", "Print the tx hashes in the console", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers }): Promise<void> {
    const signer: SignerWithAddress = (await ethers.getSigners())[0];

    // Load the pool contract.
    const hifiPoolFactory: HifiPool__factory = new HifiPool__factory(signer);
    const hifiPool: HifiPool = <HifiPool>hifiPoolFactory.attach(taskArgs.hifiPool);

    // Load the underlying contract.
    const erc20Factory: Erc20__factory = new Erc20__factory(signer);
    const underlyingAddress = await hifiPool.underlying();
    const underlying: Erc20 = <Erc20>erc20Factory.attach(underlyingAddress);

    // Load the underlying amounts.
    const poolUnderlyingAmount: BigNumber = BigNumber.from(taskArgs.poolUnderlyingAmount);
    const depositUnderlyingAmount: BigNumber = BigNumber.from(taskArgs.depositUnderlyingAmount);
    const totalUnderlyingAmount: BigNumber = poolUnderlyingAmount.add(depositUnderlyingAmount);

    // Stop if the signer does not have enough underlying.
    const underlyingBalance: BigNumber = await underlying.balanceOf(signer.address);
    console.log("Checking underlying balance ...", underlyingBalance.toString());
    if (underlyingBalance.lt(totalUnderlyingAmount)) {
      console.error("Signer does not have enough underlying.");
      return;
    }

    // Approve the pool contract to spend underlying if allowance not enough.
    console.log("Approving the pool contract to spend underlying if allowance not enough ...");
    const poolUnderlyingAllowance: BigNumber = await underlying.allowance(signer.address, hifiPool.address);
    if (poolUnderlyingAllowance.lt(poolUnderlyingAmount)) {
      await underlying.approve(hifiPool.address, MaxUint256);
    }

    // Add liquidity to the pool.
    console.log("Adding underlying liquidity to the pool ...", poolUnderlyingAmount.toString());
    const addLiquidityTx = await hifiPool.mint(poolUnderlyingAmount, { gasLimit: 500000 });
    await addLiquidityTx.wait();

    // Load the address of the hToken contract.
    console.log("Loading the address of the hToken contract ...");
    const hTokenAddress: string = await hifiPool.hToken();

    // Approve the hToken contract to spend underlying if allowance not enough.
    console.log("Approving the hToken contract to spend underlying if allowance not enough ...");
    const hTokenUnderlyingAllowance: BigNumber = await underlying.allowance(signer.address, hTokenAddress);
    if (hTokenUnderlyingAllowance.lt(depositUnderlyingAmount)) {
      await underlying.approve(hTokenAddress, MaxUint256);
    }

    // Supply the underlying in exchange for hTokens.
    console.log("Supplying the underlying to mint hTokens ...");
    const hTokenFactory: HToken__factory = new HToken__factory(signer);
    const hToken: HToken = <HToken>hTokenFactory.attach(hTokenAddress);
    const depositUnderlyingTx = await hToken.depositUnderlying(depositUnderlyingAmount, { gasLimit: 500000 });
    await depositUnderlyingTx.wait();

    // Approve the pool contract to spend underlying if allowance not enough.
    console.log("Approving the pool contract to spend underlying if allowance not enough ...");
    const poolHTokenAllowance: BigNumber = await hToken.allowance(signer.address, hifiPool.address);
    const hTokenAmount: BigNumber = depositUnderlyingAmount.mul(await hifiPool.underlyingPrecisionScalar());
    if (poolHTokenAllowance.lt(hTokenAmount)) {
      await hToken.approve(hifiPool.address, MaxUint256);
    }

    // Sell hTokens to the pool.
    console.log("Selling hTokens to the pool ...");
    const sellHTokenTx = await hifiPool.sellHToken(signer.address, hTokenAmount, { gasLimit: 500000 });
    await sellHTokenTx.wait();

    // Log the tx hashes in the console.
    if (taskArgs.printTxHashes) {
      console.table([
        ["Deposit Underlying", depositUnderlyingTx.hash],
        ["Add Liquidity", addLiquidityTx.hash],
        ["Sell HToken", sellHTokenTx.hash],
      ]);
    }
  });
