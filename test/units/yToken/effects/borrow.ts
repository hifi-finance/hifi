import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetConstants, YTokenConstants } from "../../../../utils/constants";
import { FintrollerErrors, GenericErrors, YTokenErrors } from "../../../../utils/errors";
import { OneHundredTokens, OneThousandPercentMantissa, TenTokens } from "../../../../utils/constants";
import { contextForTimeDependentTests } from "../../../../utils/mochaContexts";
import { increaseTime } from "../../../../utils/jsonRpcHelpers";
import {
  stubGetBondCollateralizationRatio,
  stubOpenVault,
  stubVaultFreeCollateral,
  stubVaultLockedCollateral,
} from "../../../stubs";

/**
 * Write tests for the following scenarios:
 * - collateral value too small
 */
export default function shouldBehaveLikeBorrow(): void {
  const borrowAmount: BigNumber = OneHundredTokens;
  const collateralAmount: BigNumber = TenTokens;

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await stubOpenVault.call(this, this.contracts.yToken.address, this.accounts.brad);
    });

    describe("when the bond did not mature", function () {
      describe("when the amount to borrow is not zero", function () {
        describe("when the bond is listed", function () {
          beforeEach(async function () {
            await stubGetBondCollateralizationRatio.call(this, this.contracts.yToken.address);
          });

          describe("when the fintroller allows borrows", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getBorrowAllowed.withArgs(this.contracts.yToken.address).returns(true);
            });

            describe("when the borrow does not overflow the debt ceiling", function () {
              beforeEach(async function () {
                await this.stubs.fintroller.mock.getBondDebtCeiling
                  .withArgs(this.contracts.yToken.address)
                  .returns(OneHundredTokens);
              });

              describe("when the caller deposited collateral", function () {
                describe("when the caller locked the collateral", function () {
                  beforeEach(async function () {
                    /* Stub the value of the locked collateral. */
                    await stubVaultLockedCollateral.call(
                      this,
                      this.contracts.yToken.address,
                      this.accounts.brad,
                      collateralAmount,
                    );

                    /* The yToken makes an internal call to this stubbed function. */
                    await this.stubs.balanceSheet.mock.getHypotheticalCollateralizationRatio
                      .withArgs(this.contracts.yToken.address, this.accounts.brad, collateralAmount, borrowAmount)
                      .returns(OneThousandPercentMantissa);
                  });

                  describe("when the call to set the new vault debt succeeds", function () {
                    beforeEach(async function () {
                      /* The yToken makes an internal call to this stubbed function. */
                      await this.stubs.balanceSheet.mock.setVaultDebt
                        .withArgs(this.contracts.yToken.address, this.accounts.brad, borrowAmount)
                        .returns(true);
                    });

                    it("borrows yTokens", async function () {
                      const oldBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.brad);
                      await this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount);
                      const newBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.brad);
                      expect(oldBalance).to.equal(newBalance.sub(borrowAmount));
                    });

                    it("emits a Borrow event", async function () {
                      await expect(this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount))
                        .to.emit(this.contracts.yToken, "Borrow")
                        .withArgs(this.accounts.brad, borrowAmount);
                    });

                    it("emits a Mint event", async function () {
                      await expect(this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount))
                        .to.emit(this.contracts.yToken, "Mint")
                        .withArgs(this.accounts.brad, borrowAmount);
                    });

                    it("emits a Transfer event", async function () {
                      await expect(this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount))
                        .to.emit(this.contracts.yToken, "Transfer")
                        .withArgs(this.contracts.yToken.address, this.accounts.brad, borrowAmount);
                    });
                  });

                  describe("when the call to set the new vault debt does not succeed", function () {
                    beforeEach(async function () {
                      await this.stubs.balanceSheet.mock.setVaultDebt
                        .withArgs(this.contracts.yToken.address, this.accounts.brad, borrowAmount)
                        .returns(false);
                    });

                    it("reverts", async function () {
                      await expect(this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount)).to.be
                        .reverted;
                    });
                  });
                });

                describe("when the caller did not lock the collateral", function () {
                  beforeEach(async function () {
                    /* Stub the value of the free collateral. */
                    await stubVaultFreeCollateral.call(
                      this,
                      this.contracts.yToken.address,
                      this.accounts.brad,
                      collateralAmount,
                    );

                    /* The yToken makes an internal call to this stubbed function. */
                    await this.stubs.balanceSheet.mock.getHypotheticalCollateralizationRatio
                      .withArgs(this.contracts.yToken.address, this.accounts.brad, Zero, borrowAmount)
                      .returns(Zero);
                  });

                  it("reverts", async function () {
                    await expect(
                      this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount),
                    ).to.be.revertedWith(YTokenErrors.BorrowLockedCollateralZero);
                  });
                });
              });

              describe("when the caller did not deposit any collateral", function () {
                beforeEach(async function () {
                  /* The yToken makes an internal call to this stubbed function. */
                  await this.stubs.balanceSheet.mock.getHypotheticalCollateralizationRatio
                    .withArgs(this.contracts.yToken.address, this.accounts.brad, Zero, borrowAmount)
                    .returns(Zero);
                });

                it("reverts", async function () {
                  await expect(
                    this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount),
                  ).to.be.revertedWith(YTokenErrors.BorrowLockedCollateralZero);
                });
              });
            });

            describe("when the borrow overflows the debt ceiling", function () {
              beforeEach(async function () {
                await this.stubs.fintroller.mock.getBondDebtCeiling
                  .withArgs(this.contracts.yToken.address)
                  .returns(Zero);
              });

              it("reverts", async function () {
                await expect(this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount)).to.be.revertedWith(
                  YTokenErrors.BorrowDebtCeilingOverflow,
                );
              });
            });
          });

          describe("when the fintroller does not allow borrows", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getBorrowAllowed.withArgs(this.contracts.yToken.address).returns(false);
            });

            it("reverts", async function () {
              await expect(this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount)).to.be.revertedWith(
                YTokenErrors.BorrowNotAllowed,
              );
            });
          });
        });

        describe("when the bond is not listed", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getBorrowAllowed
              .withArgs(this.contracts.yToken.address)
              .revertsWithReason(FintrollerErrors.BondNotListed);
          });

          it("reverts", async function () {
            await expect(this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount)).to.be.revertedWith(
              FintrollerErrors.BondNotListed,
            );
          });
        });
      });

      describe("when the amount to borrow is zero", function () {
        it("reverts", async function () {
          await expect(this.contracts.yToken.connect(this.signers.brad).borrow(Zero)).to.be.revertedWith(
            YTokenErrors.BorrowZero,
          );
        });
      });
    });

    contextForTimeDependentTests("when the bond matured", function () {
      beforeEach(async function () {
        await increaseTime(YTokenConstants.DefaultExpirationTime);
      });

      it("reverts", async function () {
        await expect(this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount)).to.be.revertedWith(
          GenericErrors.BondMatured,
        );
      });
    });
  });

  describe("when the vault is not open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.yToken.address, this.accounts.brad)
        .returns(false);
    });

    it("reverts", async function () {
      await expect(this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount)).to.be.revertedWith(
        GenericErrors.VaultNotOpen,
      );
    });
  });
}
