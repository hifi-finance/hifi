import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { DEFAULT_FEE } from "@hifi/constants";
import { FlashUniswapV3Errors } from "@hifi/errors";
import { USDC, WBTC } from "@hifi/helpers";
import { expect } from "chai";
import { utils } from "ethers";

import { shouldBehaveLikeFlashLiquidate } from "./flashLiquidate";

async function getSwapCallbackData(this: Mocha.Context, collateral: string): Promise<string> {
  const bond: string = this.contracts.hToken.address;
  const borrower: string = this.signers.borrower.address;
  const sender: string = this.signers.raider.address;
  const underlying: string = await this.contracts.hToken.underlying();
  const turnout: string = String(WBTC("0.001"));
  const underlyingAmount: string = String(USDC("10000"));
  const data: string = defaultAbiCoder.encode(
    [
      `tuple(
        address bond,
        address borrower,
        address collateral,
        bytes path,
        address sender,
        int256 turnout,
        uint256 underlyingAmount
        )`,
    ],
    [
      {
        bond,
        borrower,
        collateral,
        path: utils.solidityPack(["address", "uint24", "address"], [underlying, DEFAULT_FEE, collateral]),
        sender,
        turnout,
        underlyingAmount,
      },
    ],
  );

  return data;
}

export function shouldBehaveLikeUniswapV3SwapCallback(): void {
  context("when the data is malformed", function () {
    it("reverts", async function () {
      const fee0: BigNumber = Zero;
      const fee1: BigNumber = Zero;
      const data: string = "0x";
      await expect(
        this.contracts.flashUniswapV3.connect(this.signers.raider).uniswapV3SwapCallback(fee0, fee1, data),
      ).to.be.reverted;
    });
  });

  context("when the data is encoded correctly", function () {
    let data: string;

    beforeEach(async function () {
      data = await getSwapCallbackData.call(this, this.contracts.wbtc.address);
    });

    context("when the caller is not the UniswapV3Pool contract", function () {
      const fee0: BigNumber = Zero;
      const fee1: BigNumber = Zero;

      it("reverts", async function () {
        await expect(
          this.contracts.flashUniswapV3.connect(this.signers.raider).uniswapV3SwapCallback(fee0, fee1, data),
        ).to.be.revertedWith(FlashUniswapV3Errors.CALL_NOT_AUTHORIZED);
      });
    });

    context("when the caller is the UniswapV3Pool contract", function () {
      shouldBehaveLikeFlashLiquidate();
    });
  });
}
