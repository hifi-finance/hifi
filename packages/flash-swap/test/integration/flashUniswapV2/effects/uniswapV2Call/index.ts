import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { FlashUniswapV2Errors } from "@hifi/errors";
import { USDC, WBTC, price } from "@hifi/helpers";
import { expect } from "chai";

import type { GodModeErc20 } from "../../../../../src/types/GodModeErc20";
import { deployGodModeErc20 } from "../../../../shared/deployers";
import { increasePoolReserves } from "../../../../shared/helpers";
import { shouldBehaveLikeCollateralFlashSwap } from "./collateral";

function getFlashSwapCallData(this: Mocha.Context, collateral: string): string {
  const types = ["address", "address", "address", "uint256"];
  const borrower: string = this.signers.borrower.address;
  const bond: string = this.contracts.hToken.address;
  const turnout: string = String(WBTC("0.001"));
  const values = [borrower, bond, collateral, turnout];
  const data: string = defaultAbiCoder.encode(types, values);
  return data;
}

export function shouldBehaveLikeUniswapV2Call(): void {
  context("when the data is malformed", function () {
    it("reverts", async function () {
      const sender: string = this.signers.raider.address;
      const swapCollateralAmount: BigNumber = Zero;
      const swapUnderlyingAmount: BigNumber = Zero;
      const data: string = "0x";
      await expect(
        this.contracts.flashUniswapV2
          .connect(this.signers.raider)
          .uniswapV2Call(sender, swapCollateralAmount, swapUnderlyingAmount, data),
      ).to.be.reverted;
    });
  });

  context("when the data is encoded correctly", function () {
    let data: string;

    beforeEach(function () {
      data = getFlashSwapCallData.call(this, this.contracts.wbtc.address);
    });

    context("when the caller is not the UniswapV2Pair contract", function () {
      const swapCollateralAmount: BigNumber = Zero;
      const swapUnderlyingAmount: BigNumber = Zero;
      let sender: string;

      beforeEach(async function () {
        sender = this.signers.raider.address;
      });

      context("when the caller is an externally owned account", function () {
        it("reverts", async function () {
          // See https://hardhat.org/hardhat-network/#automatic-error-messages
          // See https://github.com/NomicFoundation/hardhat/issues/2451
          const automaticErrorMessage = "function returned an unexpected amount of data";
          await expect(
            this.contracts.flashUniswapV2
              .connect(this.signers.raider)
              .uniswapV2Call(sender, swapCollateralAmount, swapUnderlyingAmount, data),
          ).to.be.revertedWith(automaticErrorMessage);
        });
      });

      context("when the caller is a malicious pair", function () {
        it("reverts", async function () {
          const to: string = this.contracts.flashUniswapV2.address;
          await expect(
            this.contracts.maliciousPair
              .connect(this.signers.raider)
              .swap(swapCollateralAmount, swapUnderlyingAmount, to, data),
          ).to.be.revertedWith(FlashUniswapV2Errors.CALL_NOT_AUTHORIZED);
        });
      });
    });

    context("when the caller is the UniswapV2Pair contract", function () {
      context("when the underlying is not part of the UniswapV2Pair contract", function () {
        beforeEach(async function () {
          await this.contracts.wbtcPriceFeed.setPrice(price("20000"));
          await increasePoolReserves.call(this, WBTC("100"), USDC("2e6"));
        });

        it("reverts", async function () {
          const swapCollateralAmount: BigNumber = Zero;
          const swapUnderlyingAmount: BigNumber = USDC("10000");
          const foo: GodModeErc20 = await deployGodModeErc20(this.signers.admin, "Foo", "FOO", BigNumber.from(18));
          await this.contracts.hToken.__godMode_setUnderlying(foo.address);
          const to: string = this.contracts.flashUniswapV2.address;
          await expect(
            this.contracts.uniswapV2Pair
              .connect(this.signers.raider)
              .swap(swapCollateralAmount, swapUnderlyingAmount, to, data),
          ).to.be.revertedWith(FlashUniswapV2Errors.UNDERLYING_NOT_IN_POOL);
        });
      });

      context("when the underlying is part of the UniswapV2Pair contract", function () {
        context("when the collateral is the same as the underlying", function () {
          const swapCollateralAmount: BigNumber = Zero;
          const swapUnderlyingAmount: BigNumber = Zero;

          it("reverts", async function () {
            const to: string = this.contracts.flashUniswapV2.address;
            data = getFlashSwapCallData.call(this, this.contracts.usdc.address);
            await expect(
              this.contracts.maliciousPair
                .connect(this.signers.raider)
                .swap(swapCollateralAmount, swapUnderlyingAmount, to, data),
            ).to.be.revertedWith(FlashUniswapV2Errors.LIQUIDATE_UNDERLYING_BACKED_VAULT);
          });
        });

        context("when the collateral is not the same as the underlying", function () {
          context("when the collateral is flash borrowed", function () {
            beforeEach(async function () {
              await this.contracts.wbtcPriceFeed.setPrice(price("20000"));
              await increasePoolReserves.call(this, WBTC("100"), USDC("2e6"));
            });

            context("new order of tokens in the UniswapV2Pair contract", function () {
              beforeEach(async function () {
                await this.contracts.uniswapV2Pair.__godMode_setToken0(this.contracts.usdc.address);
                await this.contracts.uniswapV2Pair.__godMode_setToken1(this.contracts.wbtc.address);
                await this.contracts.uniswapV2Pair.sync();
              });

              it("reverts", async function () {
                const swapCollateralAmount: BigNumber = WBTC("1");
                const swapUnderlyingAmount: BigNumber = Zero;
                const to: string = this.contracts.flashUniswapV2.address;
                await expect(
                  this.contracts.uniswapV2Pair
                    .connect(this.signers.raider)
                    .swap(swapUnderlyingAmount, swapCollateralAmount, to, data),
                ).to.be.revertedWith(FlashUniswapV2Errors.FLASH_BORROW_COLLATERAL);
              });
            });

            context("initial order of tokens in the UniswapV2Pair contract", function () {
              it("reverts", async function () {
                const swapCollateralAmount: BigNumber = WBTC("1");
                const swapUnderlyingAmount: BigNumber = Zero;
                const to: string = this.contracts.flashUniswapV2.address;
                await expect(
                  this.contracts.uniswapV2Pair
                    .connect(this.signers.raider)
                    .swap(swapCollateralAmount, swapUnderlyingAmount, to, data),
                ).to.be.revertedWith(FlashUniswapV2Errors.FLASH_BORROW_COLLATERAL);
              });
            });
          });

          context("when the underlying is flash borrowed", function () {
            context("when the collateral is not the same as the underlying", function () {
              shouldBehaveLikeCollateralFlashSwap();
            });
          });
        });
      });
    });
  });
}
