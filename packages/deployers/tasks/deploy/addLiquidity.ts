import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { HifiPool__factory } from "@hifi/amm/typechain/factories/HifiPool__factory";
import { HifiPool } from "@hifi/amm/typechain/HifiPool";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TASK_ADD_LIQUIDITY } from "../../helpers/constants";
import { Erc20__factory } from "@hifi/amm/typechain/factories/Erc20__factory";
import { Erc20 } from "@hifi/amm/typechain/Erc20";
import { HifiProxyTarget__factory } from "@hifi/proxy-target/typechain/factories/HifiProxyTarget__factory";
import { HifiProxyTarget } from "@hifi/proxy-target/typechain/HifiProxyTarget";
import { USDC, hUSDC } from "@hifi/helpers";
import { MAX_UD60x18 } from "@hifi/constants";
import fp from "evm-fp";

task(TASK_ADD_LIQUIDITY)
  // Contract arguments
  .addParam("hifiPool", "Address of the HifiPool contract")
  .addParam("underlyingAmount", "Amount of underlying")
  .addParam("hTokenRatio", "hToken ratio")
  .addParam("hifiProxyTarget", "Address of hifi proxy target")

  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 1, types.int)
  .addOptionalParam("printHash", "Print the hash in the console", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();

    const hifiPoolFactory: HifiPool__factory = new HifiPool__factory(signers[0]);

    const hifiPool: HifiPool = <HifiPool>hifiPoolFactory.attach(taskArgs.hifiPool);

    const underlyingAddress = await hifiPool.underlying();
    const hTokenAddress = await hifiPool.hToken();

    const erc20Factory: Erc20__factory = new Erc20__factory(signers[0]);

    const underlying: Erc20 = <Erc20>erc20Factory.attach(underlyingAddress);

    const hToken: Erc20 = <Erc20>erc20Factory.attach(hTokenAddress);

    const hifiProxyTargetFactory: HifiProxyTarget__factory = new HifiProxyTarget__factory(signers[0]);
    const hifiProxyTarget: HifiProxyTarget = <HifiProxyTarget>hifiProxyTargetFactory.attach(taskArgs.hifiProxyTarget);

    const underlyingBalance: BigNumber = await underlying.balanceOf(signers[0].address);

    if (underlyingBalance >= USDC(taskArgs.underlyingAmount)) {
      const hTokenAmount: BigNumber = BigNumber.from(taskArgs.hTokenRatio * taskArgs.underlyingAmount);

      const underlyingAllowance: BigNumber = await underlying.allowance(signers[0].address, taskArgs.hifiProxyTarget);

      if (underlyingAllowance < USDC(taskArgs.underlyingAmount)) {
        await underlying.approve(taskArgs.hifiProxyTarget, fp(MAX_UD60x18));
      }
      const supplyUnderlyingtx = await hifiProxyTarget.supplyUnderlying(hTokenAddress, USDC(hTokenAmount.toString()));

      if (taskArgs.confirmations > 0) {
        await supplyUnderlyingtx.wait(taskArgs.confirmations);
      }
      const remainingUnderlying: BigNumber = BigNumber.from(taskArgs.underlyingAmount).sub(hTokenAmount);

      const addLiquiditytx = await hifiProxyTarget.addLiquidity(
        taskArgs.hifiPool,
        USDC(remainingUnderlying.toString()),
        Zero,
      );
      if (taskArgs.confirmations > 0) {
        await addLiquiditytx.wait(taskArgs.confirmations);
      }

      const hTokenAllowance: BigNumber = await hToken.allowance(signers[0].address, taskArgs.hifiProxyTarget);

      if (hTokenAllowance < hUSDC(hTokenAmount.toString())) {
        await hToken.approve(taskArgs.hifiProxyTarget, fp(MAX_UD60x18));
      }

      const minUnderlyingOut: BigNumber = await hifiPool.getQuoteForSellingHToken(hUSDC(hTokenAmount.toString()));

      const sellHtokenTx = await hifiProxyTarget.sellHToken(taskArgs.hifiPool, hUSDC(hTokenAmount.toString()), Zero);

      if (taskArgs.confirmations > 0) {
        await sellHtokenTx.wait(taskArgs.confirmations);
      }

      if (taskArgs.printHash) {
        console.table([
          ["supplyUnderlying", supplyUnderlyingtx.hash],
          ["addLiquidity", addLiquiditytx.hash],
          ["sellHToken", sellHtokenTx.hash],
        ]);
      }
    }
    return "true";
  });
