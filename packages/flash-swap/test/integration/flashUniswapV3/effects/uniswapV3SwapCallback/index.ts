import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { FlashUniswapV3Errors } from "@hifi/errors";
import { USDC, WBTC } from "@hifi/helpers";
import { expect } from "chai";

import { shouldBehaveLikeCollateralFlashSwap } from "./collateral";

interface PoolKey {
  token0: string;
  token1: string;
  fee: number;
}
function getUniswapV3FlashCallbackData(this: Mocha.Context, collateral: string, poolKey: PoolKey): string {
  const types = [
    "uint256",
    "uint256",
    "address",
    "address",
    "address",
    "address",
    "address",
    "uint24",
    "address",
    "int256",
    "address",
    "uint256",
  ];

  const flashCollateralAmount: string = String(Zero);
  const flashUnderlyingAmount: string = String(USDC("10000"));
  const bond: string = this.contracts.hToken.address;
  const borrower: string = this.signers.borrower.address;
  const sender: string = this.signers.raider.address;
  const turnout: string = String(WBTC("0.001"));
  const underlying: string = this.contracts.usdc.address;
  const flashBorrowUnderlyingAmount: string = String(USDC("10000"));
  const values = [
    flashCollateralAmount,
    flashUnderlyingAmount,
    bond,
    borrower,
    collateral,
    poolKey.token0,
    poolKey.token1,
    poolKey.fee,
    sender,
    turnout,
    underlying,
    flashBorrowUnderlyingAmount,
  ];
  const data: string = defaultAbiCoder.encode(types, values);
  return data;
}

export function shouldBehaveLikeUniswapV3FlashCallback(): void {
  context("when the data is malformed", function () {
    it("reverts", async function () {
      const fee0: BigNumber = Zero;
      const fee1: BigNumber = Zero;
      const data: string = "0x";
      await expect(
        this.contracts.flashUniswapV3.connect(this.signers.raider).uniswapV3FlashCallback(fee0, fee1, data),
      ).to.be.reverted;
    });
  });

  context("when the data is encoded correctly", function () {
    let data: string;

    beforeEach(async function () {
      const poolKey: PoolKey = await this.contracts.poolAddress
        .connect(this.signers.raider)
        .getPoolKey(this.contracts.wbtc.address, this.contracts.usdc.address, 3000);
      data = getUniswapV3FlashCallbackData.call(this, this.contracts.wbtc.address, poolKey);
    });

    context("when the caller is not the UniswapV3Pool contract", function () {
      const fee0: BigNumber = Zero;
      const fee1: BigNumber = Zero;

      context("when the caller is an externally owned account", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.flashUniswapV3.connect(this.signers.raider).uniswapV3FlashCallback(fee0, fee1, data),
          ).to.be.revertedWith(FlashUniswapV3Errors.CALL_NOT_AUTHORIZED);
        });
      });
    });

    context("when the caller is the UniswapV3Pool contract", function () {
      shouldBehaveLikeCollateralFlashSwap();
    });
  });
}
