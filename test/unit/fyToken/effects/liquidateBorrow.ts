import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { fintrollerConstants, fyTokenConstants, tokenAmounts } from "../../../../helpers/constants";
import { FyTokenErrors, GenericErrors } from "../../../../helpers/errors";
import { GodModeFyToken } from "../../../../typechain";
import { contextForTimeDependentTests } from "../../../contexts";
import { increaseTime } from "../../../jsonRpc";
import { stubIsVaultOpen } from "../../stubs";

async function stubLiquidateBorrowInternalCalls(
  this: Mocha.Context,
  fyTokenAddress: string,
  newBorrowAmount: BigNumber,
  repayAmount: BigNumber,
  clutchedCollateralAmount: BigNumber,
): Promise<void> {
  await this.stubs.balanceSheet.mock.decreaseVaultDebt
    .withArgs(fyTokenAddress, this.signers.borrower.address, repayAmount)
    .returns();
  await this.stubs.balanceSheet.mock.getClutchableCollateral
    .withArgs(fyTokenAddress, repayAmount)
    .returns(clutchedCollateralAmount);
  await this.stubs.balanceSheet.mock.clutchCollateral
    .withArgs(fyTokenAddress, this.signers.liquidator.address, this.signers.borrower.address, clutchedCollateralAmount)
    .returns();
}

export default function shouldBehaveLikeLiquidateBorrow(): void {
  const borrowAmount: BigNumber = tokenAmounts.oneHundred;
  const repayAmount: BigNumber = tokenAmounts.forty;
  const newBorrowAmount: BigNumber = borrowAmount.sub(repayAmount);

  describe("when the vault is not open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.fyToken.address, this.signers.borrower.address)
        .returns(false);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.fyToken
          .connect(this.signers.borrower)
          .liquidateBorrow(this.signers.borrower.address, repayAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await stubIsVaultOpen.call(this, this.contracts.fyToken.address, this.signers.borrower.address);
    });

    describe("when the caller is the borrower", function () {
      beforeEach(async function () {
        await this.stubs.fintroller.mock.getBondCollateralizationRatio
          .withArgs(this.contracts.fyToken.address)
          .returns(fintrollerConstants.defaultCollateralizationRatio);
        await this.stubs.balanceSheet.mock.getVaultDebt
          .withArgs(this.contracts.fyToken.address, this.signers.borrower.address)
          .returns(borrowAmount);
        await (this.contracts.fyToken as GodModeFyToken).__godMode_mint(this.signers.borrower.address, borrowAmount);
      });

      it("reverts", async function () {
        await expect(
          this.contracts.fyToken
            .connect(this.signers.borrower)
            .liquidateBorrow(this.signers.borrower.address, repayAmount),
        ).to.be.revertedWith(FyTokenErrors.LiquidateBorrowSelf);
      });
    });

    describe("when the caller is not the borrower", function () {
      describe("when the amount to repay is zero", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.fyToken
              .connect(this.signers.liquidator)
              .liquidateBorrow(this.signers.borrower.address, Zero),
          ).to.be.revertedWith(FyTokenErrors.LiquidateBorrowZero);
        });
      });

      describe("when the amount to repay is not zero", function () {
        describe("when the bond is not listed", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRepayBorrowAllowed
              .withArgs(this.contracts.fyToken.address)
              .revertsWithReason(GenericErrors.BondNotListed);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(borrowAmount),
            ).to.be.revertedWith(GenericErrors.BondNotListed);
          });
        });

        describe("when the bond is listed", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getBondCollateralizationRatio
              .withArgs(this.contracts.fyToken.address)
              .returns(fintrollerConstants.defaultCollateralizationRatio);
          });

          describe("when the fintroller does not allow liquidate borrow", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getLiquidateBorrowAllowed
                .withArgs(this.contracts.fyToken.address)
                .returns(false);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.fyToken
                  .connect(this.signers.liquidator)
                  .liquidateBorrow(this.signers.borrower.address, repayAmount),
              ).to.be.revertedWith(FyTokenErrors.LiquidateBorrowNotAllowed);
            });
          });

          describe("when the fintroller allows liquidate borrow", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getLiquidateBorrowAllowed
                .withArgs(this.contracts.fyToken.address)
                .returns(true);

              // The fyToken makes an internal call to this function.
              await this.stubs.fintroller.mock.getRepayBorrowAllowed
                .withArgs(this.contracts.fyToken.address)
                .returns(true);
            });

            describe("when the borrower does not have a debt", function () {
              beforeEach(async function () {
                // Borrowers with no debt are never underwater.
                await this.stubs.balanceSheet.mock.isAccountUnderwater
                  .withArgs(this.contracts.fyToken.address, this.signers.borrower.address)
                  .returns(false);
                await this.stubs.balanceSheet.mock.getVaultDebt
                  .withArgs(this.contracts.fyToken.address, this.signers.borrower.address)
                  .returns(Zero);
              });

              it("reverts", async function () {
                await expect(
                  this.contracts.fyToken
                    .connect(this.signers.liquidator)
                    .liquidateBorrow(this.signers.borrower.address, repayAmount),
                ).to.be.revertedWith(GenericErrors.AccountNotUnderwater);
              });
            });

            describe("when the borrower has a debt", function () {
              const clutchableCollateralAmount: BigNumber = tokenAmounts.pointFiftyFive;

              beforeEach(async function () {
                // User borrows 100 fyUSDC.
                await this.stubs.balanceSheet.mock.getVaultDebt
                  .withArgs(this.contracts.fyToken.address, this.signers.borrower.address)
                  .returns(borrowAmount);
                await (this.contracts.fyToken as GodModeFyToken).__godMode_mint(
                  this.signers.borrower.address,
                  borrowAmount,
                );

                // The fyToken makes internal calls to these stubbed functions.
                await stubLiquidateBorrowInternalCalls.call(
                  this,
                  this.contracts.fyToken.address,
                  newBorrowAmount,
                  repayAmount,
                  clutchableCollateralAmount,
                );
              });

              describe("when the account is not underwater", function () {
                beforeEach(async function () {
                  await this.stubs.balanceSheet.mock.isAccountUnderwater
                    .withArgs(this.contracts.fyToken.address, this.signers.borrower.address)
                    .returns(false);
                });

                describe("when the bond did not mature", function () {
                  it("reverts", async function () {
                    await expect(
                      this.contracts.fyToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.signers.borrower.address, repayAmount),
                    ).to.be.revertedWith(GenericErrors.AccountNotUnderwater);
                  });
                });

                contextForTimeDependentTests("when the bond matured", function () {
                  beforeEach(async function () {
                    await increaseTime(fyTokenConstants.expirationTime);

                    // Mint 100 fyUSDC to the liquidator so he can repay the debt.
                    await (this.contracts.fyToken as GodModeFyToken).__godMode_mint(
                      this.signers.liquidator.address,
                      repayAmount,
                    );
                  });

                  it("liquidates the borrower", async function () {
                    const oldBalance: BigNumber = await this.contracts.fyToken.balanceOf(
                      this.signers.liquidator.address,
                    );
                    await this.contracts.fyToken
                      .connect(this.signers.liquidator)
                      .liquidateBorrow(this.signers.borrower.address, repayAmount);
                    const newBalance: BigNumber = await this.contracts.fyToken.balanceOf(
                      this.signers.liquidator.address,
                    );
                    expect(oldBalance).to.equal(newBalance.add(repayAmount));
                  });
                });
              });

              describe("when the account is underwater", function () {
                beforeEach(async function () {
                  await this.stubs.balanceSheet.mock.isAccountUnderwater
                    .withArgs(this.contracts.fyToken.address, this.signers.borrower.address)
                    .returns(true);
                });

                describe("when the caller does not have enough fyTokens", function () {
                  it("reverts", async function () {
                    await expect(
                      this.contracts.fyToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.signers.borrower.address, repayAmount),
                    ).to.be.revertedWith(FyTokenErrors.RepayBorrowInsufficientBalance);
                  });
                });

                describe("when the caller has enough fyTokens", function () {
                  beforeEach(async function () {
                    // Mint 100 fyUSDC to the liquidator so he can repay the debt.
                    await (this.contracts.fyToken as GodModeFyToken).__godMode_mint(
                      this.signers.liquidator.address,
                      repayAmount,
                    );
                  });

                  it("liquidates the borrower", async function () {
                    const oldBalance: BigNumber = await this.contracts.fyToken.balanceOf(
                      this.signers.liquidator.address,
                    );
                    await this.contracts.fyToken
                      .connect(this.signers.liquidator)
                      .liquidateBorrow(this.signers.borrower.address, repayAmount);
                    const newBalance: BigNumber = await this.contracts.fyToken.balanceOf(
                      this.signers.liquidator.address,
                    );
                    expect(oldBalance).to.equal(newBalance.add(repayAmount));
                  });

                  it("emits a Burn event", async function () {
                    await expect(
                      this.contracts.fyToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.signers.borrower.address, repayAmount),
                    )
                      .to.emit(this.contracts.fyToken, "Burn")
                      .withArgs(this.signers.liquidator.address, repayAmount);
                  });

                  it("emits a Transfer event", async function () {
                    await expect(
                      this.contracts.fyToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.signers.borrower.address, repayAmount),
                    )
                      .to.emit(this.contracts.fyToken, "Transfer")
                      .withArgs(this.signers.liquidator.address, this.contracts.fyToken.address, repayAmount);
                  });

                  it("emits a RepayBorrow event", async function () {
                    await expect(
                      this.contracts.fyToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.signers.borrower.address, repayAmount),
                    )
                      .to.emit(this.contracts.fyToken, "RepayBorrow")
                      .withArgs(
                        this.signers.liquidator.address,
                        this.signers.borrower.address,
                        repayAmount,
                        newBorrowAmount,
                      );
                  });

                  it("emits a LiquidateBorrow event", async function () {
                    await expect(
                      this.contracts.fyToken
                        .connect(this.signers.liquidator)
                        .liquidateBorrow(this.signers.borrower.address, repayAmount),
                    )
                      .to.emit(this.contracts.fyToken, "LiquidateBorrow")
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
