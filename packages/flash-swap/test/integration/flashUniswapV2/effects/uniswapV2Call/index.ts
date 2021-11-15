import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { FlashUniswapV2Errors } from "@hifi/errors";
import { USDC, WBTC, price } from "@hifi/helpers";
import { expect } from "chai";

import type { GodModeErc20 } from "../../../../../src/types/GodModeErc20";
import { deployGodModeErc20 } from "../../../../shared/deployers";
import { increasePoolReserves } from "../../../../shared/helpers";
import { shouldBehaveLikeUnderlyingCollateral } from "./underlying";

// import { shouldBehaveLikeWbtcAsCollateral } from "./wbtc";

function encodeCallData(this: Mocha.Context): string {
  const types = ["address", "address", "address", "uint256"];
  const borrower: string = this.signers.borrower.address;
  const bond: string = this.contracts.hToken.address;
  const collateral: string = this.contracts.wbtc.address;
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
      data = encodeCallData.call(this);
    });

    context("when the caller is not a UniswapV2Pair contract", function () {
      const swapCollateralAmount: BigNumber = Zero;
      const swapUnderlyingAmount: BigNumber = Zero;
      let sender: string;

      beforeEach(async function () {
        sender = this.signers.raider.address;
      });

      context("when the caller is an externally owned account", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.flashUniswapV2
              .connect(this.signers.raider)
              .uniswapV2Call(sender, swapCollateralAmount, swapUnderlyingAmount, data),
          ).to.be.revertedWith("function call to a non-contract account");
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

    context("when the caller is a UniswapV2Pair contract", function () {
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
        context("when the other token is flash borrowed", function () {
          beforeEach(async function () {
            await this.contracts.wbtcPriceFeed.setPrice(price("20000"));
            await increasePoolReserves.call(this, WBTC("100"), USDC("2e6"));
          });

          it("reverts", async function () {
            const swapCollateralAmount: BigNumber = WBTC("1");
            const swapUnderlyingAmount: BigNumber = Zero;
            const to: string = this.contracts.flashUniswapV2.address;
            await expect(
              this.contracts.uniswapV2Pair
                .connect(this.signers.raider)
                .swap(swapCollateralAmount, swapUnderlyingAmount, to, data),
            ).to.be.revertedWith(FlashUniswapV2Errors.FLASH_BORROW_OTHER_TOKEN);
          });
        });

        context("when underlying is flash borrowed", function () {
          context("when the underlying is used as collateral", function () {
            shouldBehaveLikeUnderlyingCollateral();
          });
        });
      });
    });
  });
}
