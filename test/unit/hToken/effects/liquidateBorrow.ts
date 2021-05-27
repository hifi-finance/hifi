import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import { FINTROLLER_DEFAULT_COLLATERALIZATION_RATIO, H_TOKEN_EXPIRATION_TIME } from "../../../../helpers/constants";
import { GenericErrors, HTokenErrors } from "../../../../helpers/errors";
import { GodModeHToken } from "../../../../typechain";
import { contextForTimeDependentTests } from "../../../contexts";
import { increaseTime } from "../../../jsonRpc";
import { stubIsVaultOpen } from "../../stubs";

async function stubLiquidateBorrowInternalCalls(
  this: Mocha.Context,
  hTokenAddress: string,
  newBorrowAmount: BigNumber,
  repayAmount: BigNumber,
  clutchedCollateralAmount: BigNumber,
): Promise<void> {
  await this.stubs.balanceSheet.mock.decreaseVaultDebt
    .withArgs(hTokenAddress, this.signers.borrower.address, repayAmount)
    .returns();
  await this.stubs.balanceSheet.mock.getClutchableCollateral
    .withArgs(hTokenAddress, repayAmount)
    .returns(clutchedCollateralAmount);
  await this.stubs.balanceSheet.mock.clutchCollateral
    .withArgs(hTokenAddress, this.signers.liquidator.address, this.signers.borrower.address, clutchedCollateralAmount)
    .returns();
}

export default function shouldBehaveLikeLiquidateBorrow(): void {
  const borrowAmount: BigNumber = fp("100");
  const repayAmount: BigNumber = fp("40");
  const newBorrowAmount: BigNumber = borrowAmount.sub(repayAmount);

  context("when the vault is not open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.hToken.address, this.signers.borrower.address)
        .returns(false);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.hToken
          .connect(this.signers.borrower)
          .liquidateBorrow(this.signers.borrower.address, repayAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  context("when the vault is open", function () {
    beforeEach(async function () {
      await stubIsVaultOpen.call(this, this.contracts.hToken.address, this.signers.borrower.address);
    });

    context("when the caller is the borrower", function () {
      beforeEach(async function () {
        await this.stubs.fintroller.mock.getBondCollateralizationRatio
          .withArgs(this.contracts.hToken.address)
          .returns(FINTROLLER_DEFAULT_COLLATERALIZATION_RATIO);
        await this.stubs.balanceSheet.mock.getVaultDebt
          .withArgs(this.contracts.hToken.address, this.signers.borrower.address)
          .returns(borrowAmount);
        await (this.contracts.hToken as GodModeHToken).__godMode_mint(this.signers.borrower.address, borrowAmount);
      });

      it("reverts", async function () {
        await expect(
          this.contracts.hToken
            .connect(this.signers.borrower)
            .liquidateBorrow(this.signers.borrower.address, repayAmount),
        ).to.be.revertedWith(HTokenErrors.LiquidateBorrowSelf);
      });
    });

    context("when the caller is not the borrower", function () {
      context("when the amount to repay is zero", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.hToken.connect(this.signers.liquidator).liquidateBorrow(this.signers.borrower.address, Zero),
          ).to.be.revertedWith(HTokenErrors.LiquidateBorrowZero);
        });
      });

      context("when the amount to repay is not zero", function () {
        context("when the bond is not listed", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRepayBorrowAllowed
              .withArgs(this.contracts.hToken.address)
              .revertsWithReason(GenericErrors.BondNotListed);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.hToken.connect(this.signers.borrower).repayBorrow(borrowAmount),
            ).to.be.revertedWith(GenericErrors.BondNotListed);
          });
        });

        context("when the bond is listed", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getBondCollateralizationRatio
              .withArgs(this.contracts.hToken.address)
              .returns(FINTROLLER_DEFAULT_COLLATERALIZATION_RATIO);
          });

          context("when the fintroller does not allow liquidate borrow", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getLiquidateBorrowAllowed
                .withArgs(this.contracts.hToken.address)
                .returns(false);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.hToken
                  .connect(this.signers.liquidator)
                  .liquidateBorrow(this.signers.borrower.address, repayAmount),
              ).to.be.revertedWith(HTokenErrors.LiquidateBorrowNotAllowed);
            });
          });

          context("when the fintroller allows liquidate borrow", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getLiquidateBorrowAllowed
                .withArgs(this.contracts.hToken.address)
                .returns(true);

              // The hToken makes an internal call to this function.
              await this.stubs.fintroller.mock.getRepayBorrowAllowed
                .withArgs(this.contracts.hToken.address)
                .returns(true);
            });

            context("when the borrower does not have a debt", function () {
              beforeEach(async function () {
                // Borrowers with no debt are never underwater.
                await this.stubs.balanceSheet.mock.isAccountUnderwater
                  .withArgs(this.contracts.hToken.address, this.signers.borrower.address)
                  .returns(false);
                await this.stubs.balanceSheet.mock.getVaultDebt
                  .withArgs(this.contracts.hToken.address, this.signers.borrower.address)
                  .returns(Zero);
              });

              it("reverts", async function () {
                await expect(
                  this.contracts.hToken
                    .connect(this.signers.liquidator)
                    .liquidateBorrow(this.signers.borrower.address, repayAmount),
                ).to.be.revertedWith(GenericErrors.AccountNotUnderwater);
              });
            });

            context("when the borrower has a debt", function () {
              const clutchableCollateralAmount: BigNumber = fp("0.55");

              beforeEach(async function () {
                // User borrows 100 fyUSDC.
                await this.stubs.balanceSheet.mock.getVaultDebt
                  .withArgs(this.contracts.hToken.address, this.signers.borrower.address)
                  .returns(borrowAmount);
                await (this.contracts.hToken as GodModeHToken).__godMode_mint(
                  this.signers.borrower.address,
                  borrowAmount,
                );

                // The hToken makes internal calls to these stubbed functions.
                await stubLiquidateBorrowInternalCalls.call(
                  this,
                  this.contracts.hToken.address,
                  newBorrowAmount,
                  repayAmount,
                  clutchableCollateralAmount,
                );
              });

              context("when the account is not underwater", function () {
                beforeEach(async function () {
                  await this.stubs.balanceSheet.mock.isAccountUnderwater
                    .withArgs(this.contracts.hToken.address, this.signers.borrower.address)
                    .returns(false);
                });

                context("when the bond did not mature", function () {
                  it("reverts", async function () {
                    await expect(
                      this.contracts.hToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.signers.borrower.address, repayAmount),
                    ).to.be.revertedWith(GenericErrors.AccountNotUnderwater);
                  });
                });

                contextForTimeDependentTests("when the bond matured", function () {
                  beforeEach(async function () {
                    await increaseTime(H_TOKEN_EXPIRATION_TIME);

                    // Mint 100 fyUSDC to the liquidator so he can repay the debt.
                    await (this.contracts.hToken as GodModeHToken).__godMode_mint(
                      this.signers.liquidator.address,
                      repayAmount,
                    );
                  });

                  it("liquidates the borrower", async function () {
                    const oldBalance: BigNumber = await this.contracts.hToken.balanceOf(
                      this.signers.liquidator.address,
                    );
                    await this.contracts.hToken
                      .connect(this.signers.liquidator)
                      .liquidateBorrow(this.signers.borrower.address, repayAmount);
                    const newBalance: BigNumber = await this.contracts.hToken.balanceOf(
                      this.signers.liquidator.address,
                    );
                    expect(oldBalance).to.equal(newBalance.add(repayAmount));
                  });
                });
              });

              context("when the account is underwater", function () {
                beforeEach(async function () {
                  await this.stubs.balanceSheet.mock.isAccountUnderwater
                    .withArgs(this.contracts.hToken.address, this.signers.borrower.address)
                    .returns(true);
                });

                context("when the caller does not have enough hTokens", function () {
                  it("reverts", async function () {
                    await expect(
                      this.contracts.hToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.signers.borrower.address, repayAmount),
                    ).to.be.revertedWith(HTokenErrors.RepayBorrowInsufficientBalance);
                  });
                });

                context("when the caller has enough hTokens", function () {
                  beforeEach(async function () {
                    // Mint 100 fyUSDC to the liquidator so he can repay the debt.
                    await (this.contracts.hToken as GodModeHToken).__godMode_mint(
                      this.signers.liquidator.address,
                      repayAmount,
                    );
                  });

                  it("liquidates the borrower", async function () {
                    const oldBalance: BigNumber = await this.contracts.hToken.balanceOf(
                      this.signers.liquidator.address,
                    );
                    await this.contracts.hToken
                      .connect(this.signers.liquidator)
                      .liquidateBorrow(this.signers.borrower.address, repayAmount);
                    const newBalance: BigNumber = await this.contracts.hToken.balanceOf(
                      this.signers.liquidator.address,
                    );
                    expect(oldBalance).to.equal(newBalance.add(repayAmount));
                  });

                  it("emits a Burn event", async function () {
                    await expect(
                      this.contracts.hToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.signers.borrower.address, repayAmount),
                    )
                      .to.emit(this.contracts.hToken, "Burn")
                      .withArgs(this.signers.liquidator.address, repayAmount);
                  });

                  it("emits a Transfer event", async function () {
                    await expect(
                      this.contracts.hToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.signers.borrower.address, repayAmount),
                    )
                      .to.emit(this.contracts.hToken, "Transfer")
                      .withArgs(this.signers.liquidator.address, this.contracts.hToken.address, repayAmount);
                  });

                  it("emits a RepayBorrow event", async function () {
                    await expect(
                      this.contracts.hToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.signers.borrower.address, repayAmount),
                    )
                      .to.emit(this.contracts.hToken, "RepayBorrow")
                      .withArgs(
                        this.signers.liquidator.address,
                        this.signers.borrower.address,
                        repayAmount,
                        newBorrowAmount,
                      );
                  });

                  it("emits a LiquidateBorrow event", async function () {
                    await expect(
                      this.contracts.hToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.signers.borrower.address, repayAmount),
                    )
                      .to.emit(this.contracts.hToken, "LiquidateBorrow")
                      .withArgs(
                        this.signers.liquidator.address,
                        this.signers.borrower.address,
                        repayAmount,
                        clutchableCollateralAmount,
                      );
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}
