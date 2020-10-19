import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FintrollerConstants, Percentages, TokenAmounts } from "../../../../helpers/constants";
import { FintrollerErrors, GenericErrors, YTokenErrors } from "../../../../helpers/errors";
import { YTokenConstants } from "../../../../helpers/constants";
import { contextForTimeDependentTests } from "../../../../helpers/mochaContexts";
import { increaseTime } from "../../../../helpers/jsonRpcHelpers";
import { stubIsVaultOpen, stubVaultFreeCollateral, stubVaultLockedCollateral } from "../../../stubs";

export default function shouldBehaveLikeBorrow(): void {
  const borrowAmount: BigNumber = TokenAmounts.OneHundred;
  const collateralAmount: BigNumber = TokenAmounts.Ten;

  describe("when the vault is not open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.yToken.address, this.accounts.borrower)
        .returns(false);
    });

    it("reverts", async function () {
      await expect(this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount)).to.be.revertedWith(
        GenericErrors.VaultNotOpen,
      );
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await stubIsVaultOpen.call(this, this.contracts.yToken.address, this.accounts.borrower);
    });

    contextForTimeDependentTests("when the bond matured", function () {
      beforeEach(async function () {
        await increaseTime(YTokenConstants.DefaultExpirationTime);
      });

      it("reverts", async function () {
        await expect(this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount)).to.be.revertedWith(
          GenericErrors.BondMatured,
        );
      });
    });

    describe("when the bond did not mature", function () {
      describe("when the amount to borrow is zero", function () {
        it("reverts", async function () {
          await expect(this.contracts.yToken.connect(this.signers.borrower).borrow(Zero)).to.be.revertedWith(
            YTokenErrors.BorrowZero,
          );
        });
      });

      describe("when the amount to borrow is not zero", function () {
        describe("when the bond is not listed", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getBorrowAllowed
              .withArgs(this.contracts.yToken.address)
              .revertsWithReason(FintrollerErrors.BondNotListed);
          });

          it("reverts", async function () {
            await expect(this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount)).to.be.revertedWith(
              FintrollerErrors.BondNotListed,
            );
          });
        });

        describe("when the bond is listed", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getBondCollateralizationRatio
              .withArgs(this.contracts.yToken.address)
              .returns(FintrollerConstants.DefaultBond.CollateralizationRatio);
          });

          describe("when the fintroller does not allow borrows", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getBorrowAllowed.withArgs(this.contracts.yToken.address).returns(false);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount),
              ).to.be.revertedWith(YTokenErrors.BorrowNotAllowed);
            });
          });

          describe("when the fintroller allows borrows", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getBorrowAllowed.withArgs(this.contracts.yToken.address).returns(true);
            });

            describe("when the borrow overflows the debt ceiling", function () {
              beforeEach(async function () {
                await this.stubs.fintroller.mock.getBondDebtCeiling
                  .withArgs(this.contracts.yToken.address)
                  .returns(Zero);
              });

              it("reverts", async function () {
                await expect(
                  this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount),
                ).to.be.revertedWith(YTokenErrors.BorrowDebtCeilingOverflow);
              });
            });

            describe("when the borrow does not overflow the debt ceiling", function () {
              beforeEach(async function () {
                await this.stubs.fintroller.mock.getBondDebtCeiling
                  .withArgs(this.contracts.yToken.address)
                  .returns(TokenAmounts.OneHundred);
              });

              describe("when the caller did not deposit any collateral", function () {
                beforeEach(async function () {
                  /* The yToken makes an internal call to this stubbed function. */
                  await this.stubs.balanceSheet.mock.getHypotheticalCollateralizationRatio
                    .withArgs(this.contracts.yToken.address, this.accounts.borrower, Zero, borrowAmount)
                    .returns(Zero);
                });

                it("reverts", async function () {
                  await expect(
                    this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount),
                  ).to.be.revertedWith(YTokenErrors.BorrowLockedCollateralZero);
                });
              });

              describe("when the caller deposited collateral", function () {
                describe("when the caller did not lock the collateral", function () {
                  beforeEach(async function () {
                    /* Stub the value of the free collateral. */
                    await stubVaultFreeCollateral.call(
                      this,
                      this.contracts.yToken.address,
                      this.accounts.borrower,
                      collateralAmount,
                    );

                    /* The yToken makes an internal call to this stubbed function. */
                    await this.stubs.balanceSheet.mock.getHypotheticalCollateralizationRatio
                      .withArgs(this.contracts.yToken.address, this.accounts.borrower, Zero, borrowAmount)
                      .returns(Zero);
                  });

                  it("reverts", async function () {
                    await expect(
                      this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount),
                    ).to.be.revertedWith(YTokenErrors.BorrowLockedCollateralZero);
                  });
                });

                describe("when the caller locked the collateral", function () {
                  beforeEach(async function () {
                    await stubVaultLockedCollateral.call(
                      this,
                      this.contracts.yToken.address,
                      this.accounts.borrower,
                      collateralAmount,
                    );
                  });

                  describe("when the user is dangerously collateralized", function () {
                    const dangerousCollateralizationRatio: BigNumber = Percentages.OneHundredAndTwenty;

                    beforeEach(async function () {
                      await this.stubs.balanceSheet.mock.getHypotheticalCollateralizationRatio
                        .withArgs(this.contracts.yToken.address, this.accounts.borrower, collateralAmount, borrowAmount)
                        .returns(dangerousCollateralizationRatio);
                    });

                    it("reverts", async function () {
                      await expect(
                        this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount),
                      ).to.be.revertedWith(GenericErrors.BelowCollateralizationRatio);
                    });
                  });

                  describe("when the user is safely collateralized", function () {
                    const safeCollateralizationRatio: BigNumber = Percentages.OneThousand;

                    beforeEach(async function () {
                      await this.stubs.balanceSheet.mock.getHypotheticalCollateralizationRatio
                        .withArgs(this.contracts.yToken.address, this.accounts.borrower, collateralAmount, borrowAmount)
                        .returns(safeCollateralizationRatio);
                    });

                    describe("when the call to set the new vault debt does not succeed", function () {
                      beforeEach(async function () {
                        await this.stubs.balanceSheet.mock.setVaultDebt
                          .withArgs(this.contracts.yToken.address, this.accounts.borrower, borrowAmount)
                          .returns(false);
                      });

                      it("reverts", async function () {
                        await expect(this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount)).to.be
                          .reverted;
                      });
                    });

                    describe("when the call to set the new vault debt succeeds", function () {
                      beforeEach(async function () {
                        await this.stubs.balanceSheet.mock.setVaultDebt
                          .withArgs(this.contracts.yToken.address, this.accounts.borrower, borrowAmount)
                          .returns(true);
                      });

                      it("borrows yTokens", async function () {
                        const oldBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.borrower);
                        await this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount);
                        const newBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.borrower);
                        expect(oldBalance).to.equal(newBalance.sub(borrowAmount));
                      });

                      it("emits a Borrow event", async function () {
                        await expect(this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount))
                          .to.emit(this.contracts.yToken, "Borrow")
                          .withArgs(this.accounts.borrower, borrowAmount);
                      });

                      it("emits a Mint event", async function () {
                        await expect(this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount))
                          .to.emit(this.contracts.yToken, "Mint")
                          .withArgs(this.accounts.borrower, borrowAmount);
                      });

                      it("emits a Transfer event", async function () {
                        await expect(this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount))
                          .to.emit(this.contracts.yToken, "Transfer")
                          .withArgs(this.contracts.yToken.address, this.accounts.borrower, borrowAmount);
                      });
                    });
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
