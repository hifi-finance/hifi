import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FintrollerConstants, TokenAmounts, YTokenConstants } from "../../../../helpers/constants";
import { FintrollerErrors, GenericErrors, YTokenErrors } from "../../../../helpers/errors";
import { contextForTimeDependentTests } from "../../../../helpers/mochaContexts";
import { increaseTime } from "../../../../helpers/jsonRpcHelpers";
import { stubIsVaultOpen } from "../../../stubs";

async function stubLiquidateBorrowInternalCalls(
  this: Mocha.Context,
  yTokenAddress: string,
  newBorrowAmount: BigNumber,
  repayAmount: BigNumber,
  lockedCollateral: BigNumber,
  clutchedCollateralAmount: BigNumber,
): Promise<void> {
  await this.stubs.balanceSheet.mock.setVaultDebt
    .withArgs(yTokenAddress, this.accounts.borrower, newBorrowAmount)
    .returns(true);
  await this.stubs.balanceSheet.mock.getClutchableCollateral
    .withArgs(yTokenAddress, repayAmount)
    .returns(clutchedCollateralAmount);
  await this.stubs.balanceSheet.mock.getVaultLockedCollateral
    .withArgs(this.contracts.yToken.address, this.accounts.borrower)
    .returns(lockedCollateral);
  await this.stubs.balanceSheet.mock.clutchCollateral
    .withArgs(yTokenAddress, this.accounts.liquidator, this.accounts.borrower, clutchedCollateralAmount)
    .returns(true);
}

export default function shouldBehaveLikeLiquidateBorrow(): void {
  const borrowAmount: BigNumber = TokenAmounts.OneHundred;
  const lockedCollateral: BigNumber = TokenAmounts.Ten;
  const repayAmount: BigNumber = TokenAmounts.Forty;
  const newBorrowAmount: BigNumber = borrowAmount.sub(repayAmount);

  describe("when the vault is not open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.yToken.address, this.accounts.borrower)
        .returns(false);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.yToken.connect(this.signers.borrower).liquidateBorrow(this.accounts.borrower, repayAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await stubIsVaultOpen.call(this, this.contracts.yToken.address, this.accounts.borrower);
    });

    describe("when the caller is the borrower", function () {
      beforeEach(async function () {
        await this.stubs.fintroller.mock.getBondCollateralizationRatio
          .withArgs(this.contracts.yToken.address)
          .returns(FintrollerConstants.DefaultBond.CollateralizationRatio);
        await this.stubs.balanceSheet.mock.getVaultDebt
          .withArgs(this.contracts.yToken.address, this.accounts.borrower)
          .returns(borrowAmount);
        await this.contracts.yToken.__godMode_mint(this.accounts.borrower, borrowAmount);
      });

      it("reverts", async function () {
        await expect(
          this.contracts.yToken.connect(this.signers.borrower).liquidateBorrow(this.accounts.borrower, repayAmount),
        ).to.be.revertedWith(YTokenErrors.LiquidateBorrowSelf);
      });
    });

    describe("when the caller is not the borrower", function () {
      describe("when the amount to repay is zero", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.yToken.connect(this.signers.liquidator).liquidateBorrow(this.accounts.borrower, Zero),
          ).to.be.revertedWith(YTokenErrors.LiquidateBorrowZero);
        });
      });

      describe("when the amount to repay is not zero", function () {
        describe("when the bond is not listed", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRepayBorrowAllowed
              .withArgs(this.contracts.yToken.address)
              .revertsWithReason(FintrollerErrors.BondNotListed);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.yToken.connect(this.signers.borrower).repayBorrow(borrowAmount),
            ).to.be.revertedWith(FintrollerErrors.BondNotListed);
          });
        });

        describe("when the bond is listed", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getBondCollateralizationRatio
              .withArgs(this.contracts.yToken.address)
              .returns(FintrollerConstants.DefaultBond.CollateralizationRatio);
          });

          describe("when the fintroller does not allow liquidate borrow", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getLiquidateBorrowAllowed
                .withArgs(this.contracts.yToken.address)
                .returns(false);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.yToken
                  .connect(this.signers.liquidator)
                  .liquidateBorrow(this.accounts.borrower, repayAmount),
              ).to.be.revertedWith(YTokenErrors.LiquidateBorrowNotAllowed);
            });
          });

          describe("when the fintroller allows liquidate borrow", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getLiquidateBorrowAllowed
                .withArgs(this.contracts.yToken.address)
                .returns(true);

              /* The yToken makes an internal call to this function. */
              await this.stubs.fintroller.mock.getRepayBorrowAllowed
                .withArgs(this.contracts.yToken.address)
                .returns(true);
            });

            describe("when the borrower does not have a debt", function () {
              beforeEach(async function () {
                /* Borrowers with no debt are never underwater. */
                await this.stubs.balanceSheet.mock.isAccountUnderwater
                  .withArgs(this.contracts.yToken.address, this.accounts.borrower)
                  .returns(false);
                await this.stubs.balanceSheet.mock.getVaultDebt
                  .withArgs(this.contracts.yToken.address, this.accounts.borrower)
                  .returns(Zero);
              });

              it("reverts", async function () {
                await expect(
                  this.contracts.yToken
                    .connect(this.signers.liquidator)
                    .liquidateBorrow(this.accounts.borrower, repayAmount),
                ).to.be.revertedWith(GenericErrors.AccountNotUnderwater);
              });
            });

            describe("when the borrower has a debt", function () {
              const clutchableCollateralAmount: BigNumber = TokenAmounts.PointFiftyFive;

              beforeEach(async function () {
                /* User borrows 100 yDAI. */
                await this.stubs.balanceSheet.mock.getVaultDebt
                  .withArgs(this.contracts.yToken.address, this.accounts.borrower)
                  .returns(borrowAmount);
                await this.contracts.yToken.__godMode_mint(this.accounts.borrower, borrowAmount);

                /* The yToken makes internal calls to these stubbed functions. */
                await stubLiquidateBorrowInternalCalls.call(
                  this,
                  this.contracts.yToken.address,
                  newBorrowAmount,
                  repayAmount,
                  lockedCollateral,
                  clutchableCollateralAmount,
                );
              });

              describe("when the account is not underwater", function () {
                beforeEach(async function () {
                  await this.stubs.balanceSheet.mock.isAccountUnderwater
                    .withArgs(this.contracts.yToken.address, this.accounts.borrower)
                    .returns(false);
                });

                describe("when the bond did not mature", function () {
                  it("reverts", async function () {
                    await expect(
                      this.contracts.yToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.accounts.borrower, repayAmount),
                    ).to.be.revertedWith(GenericErrors.AccountNotUnderwater);
                  });
                });

                contextForTimeDependentTests("when the bond matured", function () {
                  beforeEach(async function () {
                    await increaseTime(YTokenConstants.DefaultExpirationTime);

                    /* Mint 100 yDAI to Liquidator so he can repay the debt. */
                    await this.contracts.yToken.__godMode_mint(this.accounts.liquidator, repayAmount);
                  });

                  it("liquidates the borrower", async function () {
                    const oldBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.liquidator);
                    await this.contracts.yToken
                      .connect(this.signers.liquidator)
                      .liquidateBorrow(this.accounts.borrower, repayAmount);
                    const newBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.liquidator);
                    expect(oldBalance).to.equal(newBalance.add(repayAmount));
                  });
                });
              });

              describe("when the account is underwater", function () {
                beforeEach(async function () {
                  await this.stubs.balanceSheet.mock.isAccountUnderwater
                    .withArgs(this.contracts.yToken.address, this.accounts.borrower)
                    .returns(true);
                });

                describe("when the caller does not have enough yTokens", function () {
                  it("reverts", async function () {
                    await expect(
                      this.contracts.yToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.accounts.borrower, repayAmount),
                    ).to.be.revertedWith(YTokenErrors.RepayBorrowInsufficientBalance);
                  });
                });

                describe("when the caller has enough yTokens", function () {
                  beforeEach(async function () {
                    /* Mint 100 yDAI to Liquidator so he can repay the debt. */
                    await this.contracts.yToken.__godMode_mint(this.accounts.liquidator, repayAmount);
                  });

                  it("liquidates the borrower", async function () {
                    const oldBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.liquidator);
                    await this.contracts.yToken
                      .connect(this.signers.liquidator)
                      .liquidateBorrow(this.accounts.borrower, repayAmount);
                    const newBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.liquidator);
                    expect(oldBalance).to.equal(newBalance.add(repayAmount));
                  });

                  it("emits a Burn event", async function () {
                    await expect(
                      this.contracts.yToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.accounts.borrower, repayAmount),
                    )
                      .to.emit(this.contracts.yToken, "Burn")
                      .withArgs(this.accounts.liquidator, repayAmount);
                  });

                  it("emits a Transfer event", async function () {
                    await expect(
                      this.contracts.yToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.accounts.borrower, repayAmount),
                    )
                      .to.emit(this.contracts.yToken, "Transfer")
                      .withArgs(this.accounts.liquidator, this.contracts.yToken.address, repayAmount);
                  });

                  it("emits a RepayBorrow event", async function () {
                    await expect(
                      this.contracts.yToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.accounts.borrower, repayAmount),
                    )
                      .to.emit(this.contracts.yToken, "RepayBorrow")
                      .withArgs(this.accounts.liquidator, this.accounts.borrower, repayAmount, newBorrowAmount);
                  });

                  it("emits a LiquidateBorrow event", async function () {
                    await expect(
                      this.contracts.yToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.accounts.borrower, repayAmount),
                    )
                      .to.emit(this.contracts.yToken, "LiquidateBorrow")
                      .withArgs(
                        this.accounts.liquidator,
                        this.accounts.borrower,
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
