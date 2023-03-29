import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { FlashUniswapV3Errors } from "@hifi/errors";
import { USDC, WBTC } from "@hifi/helpers";
import { expect } from "chai";

import { shouldBehaveLikeCollateralFlashSwap } from "./collateral";

async function getSwapCallbackData(
  this: Mocha.Context,
  collateral: string,
  token0: string,
  token1: string,
  fee: number,
): Promise<string> {
  const types = ["address", "address", "address", "address", "address", "uint24", "address", "int256", "uint256"];
  const bond: string = this.contracts.hToken.address;
  const borrower: string = this.signers.borrower.address;
  const sender: string = this.signers.raider.address;
  const turnout: string = String(WBTC("0.001"));
  const underlyingAmount: string = String(USDC("10000"));
  const values = [bond, borrower, collateral, token0, token1, fee, sender, turnout, underlyingAmount];
  const data: string = defaultAbiCoder.encode(types, values);
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
      const { token0, token1, fee } = this.contracts.uniswapV3Pool;
      data = await getSwapCallbackData.call(
        this,
        this.contracts.wbtc.address,
        await token0(),
        await token1(),
        await fee(),
      );
    });

    context("when the caller is not the UniswapV3Pool contract", function () {
      const fee0: BigNumber = Zero;
      const fee1: BigNumber = Zero;

      context("when the caller is an externally owned account", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.flashUniswapV3.connect(this.signers.raider).uniswapV3SwapCallback(fee0, fee1, data),
          ).to.be.revertedWith(FlashUniswapV3Errors.CALL_NOT_AUTHORIZED);
        });
      });
    });

    context("when the caller is the UniswapV3Pool contract", function () {
      shouldBehaveLikeCollateralFlashSwap();
    });
  });
}
