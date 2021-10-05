import { BigNumber } from "@ethersproject/bignumber";
import { Erc20 } from "@hifi/amm/typechain/Erc20";
import { Erc20__factory } from "@hifi/amm/typechain/factories/Erc20__factory";
import { HifiPool__factory } from "@hifi/amm/typechain/factories/HifiPool__factory";
import { HifiPool } from "@hifi/amm/typechain/HifiPool";
import { MaxUint256 } from "@ethersproject/constants";
import { HToken__factory } from "@hifi/protocol/typechain/factories/HToken__factory";
import { HToken } from "@hifi/protocol/typechain/HToken";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { TASK_INIT_ADD_LIQUIDITY } from "../../helpers/constants";

task(TASK_INIT_ADD_LIQUIDITY)
  // Contract arguments
  .addParam("hifiPool", "Address of the HifiPool contract")
  .addParam("poolUnderlyingAmount", "Amount of underlying to add as liquidity in the pool")
  .addParam("supplyUnderlyingAmount", "Amount of underlying to supply in exchange of hTokens")
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
    const supplyUnderlyingAmount: BigNumber = BigNumber.from(taskArgs.supplyUnderlyingAmount);
    const totalUnderlyingAmount: BigNumber = poolUnderlyingAmount.add(supplyUnderlyingAmount);

    // Stop if the signer does not have enough underlying.
    const underlyingBalance: BigNumber = await underlying.balanceOf(signer.address);
    if (underlyingBalance.lt(totalUnderlyingAmount)) {
      return;
    }

    // Approve the pool contract to spend underlying if allowance not enough.
    const poolUnderlyingAllowance: BigNumber = await underlying.allowance(signer.address, hifiPool.address);
    if (poolUnderlyingAllowance.lt(poolUnderlyingAmount)) {
      await underlying.approve(hifiPool.address, MaxUint256);
    }

    // Add liquidity to the pool.
    const addLiquidityTx = await hifiPool.mint(poolUnderlyingAmount);
    await addLiquidityTx.wait();

    // Load the hToken address.
    const hTokenAddress: string = await hifiPool.hToken();

    // Approve the hToken contract to spend underlying if allowance not enough.
    const hTokenUnderlyingAllowance: BigNumber = await underlying.allowance(signer.address, hTokenAddress);
    if (hTokenUnderlyingAllowance.lt(supplyUnderlyingAmount)) {
      await underlying.approve(hTokenAddress, MaxUint256);
    }

    // Supply the underlying in exchange of hTokens.
    const hTokenFactory: HToken__factory = new HToken__factory(signer);
    const hToken: HToken = <HToken>hTokenFactory.attach(hTokenAddress);
    const supplyUnderlyingTx = await hToken.supplyUnderlying(supplyUnderlyingAmount);
    await supplyUnderlyingTx.wait();

    // Approve the pool contract to spend underlying if allowance not enough.
    const poolHTokenAllowance: BigNumber = await hToken.allowance(signer.address, hifiPool.address);
    const hTokenAmount: BigNumber = supplyUnderlyingAmount.mul(await hifiPool.underlyingPrecisionScalar());
    if (poolHTokenAllowance.lt(hTokenAmount)) {
      await hToken.approve(hifiPool.address, MaxUint256);
    }

    // Sell hTokens to the pool.
    const sellHTokenTx = await hifiPool.sellHToken(signer.address, hTokenAmount);
    await sellHTokenTx.wait();

    // Log the tx hashes in the console.
    if (taskArgs.printTxHashes) {
      console.table([
        ["supplyUnderlying", supplyUnderlyingTx.hash],
        ["addLiquidity", addLiquidityTx.hash],
        ["sellHToken", sellHTokenTx.hash],
      ]);
    }
  });
