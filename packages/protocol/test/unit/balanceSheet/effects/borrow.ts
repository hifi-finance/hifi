import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { COLLATERAL_RATIOS, DEFAULT_MAX_BONDS } from "@hifi/constants";
import { WBTC, WETH, hUSDC } from "@hifi/helpers";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../shared/errors";

export default function shouldBehaveLikeBorrow(): void {
  context("when the Fintroller does not allow borrows", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getBorrowAllowed.withArgs(this.mocks.hTokens[0].address).returns(false);
    });

    it("reverts", async function () {
      const borrowAmount: BigNumber = Zero;
      await expect(
        this.contracts.balanceSheet.connect(this.signers.borrower).borrow(this.mocks.hTokens[0].address, borrowAmount),
      ).to.be.revertedWith(BalanceSheetErrors.BorrowNotAllowed);
    });
  });

  context("when the Fintroller allows borrows", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getBorrowAllowed.withArgs(this.mocks.hTokens[0].address).returns(true);
    });

    context("when the bond matured", function () {
      beforeEach(async function () {
        await this.mocks.hTokens[0].mock.isMatured.returns(true);
      });

      it("reverts", async function () {
        const borrowAmount: BigNumber = Zero;
        await expect(
          this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .borrow(this.mocks.hTokens[0].address, borrowAmount),
        ).to.be.revertedWith(BalanceSheetErrors.BondMatured);
      });
    });

    context("when the bond did not mature", function () {
      beforeEach(async function () {
        await this.mocks.hTokens[0].mock.isMatured.returns(false);
      });

      context("when the amount to borrow is zero", function () {
        it("reverts", async function () {
          const borrowAmount: BigNumber = Zero;
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .borrow(this.mocks.hTokens[0].address, borrowAmount),
          ).to.be.revertedWith(BalanceSheetErrors.BorrowZero);
        });
      });

      context("when the amount to borrow is not zero", function () {
        const borrowAmounts: BigNumber[] = [hUSDC("15000"), hUSDC("20000")];

        context("when the borrow overflows the debt ceiling", function () {
          beforeEach(async function () {
            const debtCeiling: BigNumber = borrowAmounts[0].sub(1);
            await this.mocks.fintroller.mock.getDebtCeiling
              .withArgs(this.mocks.hTokens[0].address)
              .returns(debtCeiling);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .borrow(this.mocks.hTokens[0].address, borrowAmounts[0]),
            ).to.be.revertedWith(BalanceSheetErrors.DebtCeilingOverflow);
          });
        });

        context("when the borrow does not overflow the debt ceiling", function () {
          const debtCeiling: BigNumber = hUSDC("1e9");

          beforeEach(async function () {
            await this.mocks.fintroller.mock.getDebtCeiling
              .withArgs(this.mocks.hTokens[0].address)
              .returns(debtCeiling);
          });

          context("when the borrow exceeds the max bonds", function () {
            beforeEach(async function () {
              const maxBonds: BigNumber = Zero;
              await this.mocks.fintroller.mock.maxBonds.returns(maxBonds);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.balanceSheet
                  .connect(this.signers.borrower)
                  .borrow(this.mocks.hTokens[0].address, borrowAmounts[0]),
              ).to.be.revertedWith(BalanceSheetErrors.BorrowMaxBounds);
            });
          });

          context("when the borrow does not exceed the max bonds", function () {
            const wbtcDepositAmount: BigNumber = WBTC("1");
            const wethDepositAmount: BigNumber = WETH("10");

            beforeEach(async function () {
              const maxBonds: BigNumber = DEFAULT_MAX_BONDS;
              await this.mocks.fintroller.mock.maxBonds.returns(maxBonds);
            });

            context("when the caller runs into a liquidity shortfall", function () {
              context("when the caller did not deposit collateral", function () {
                it("reverts", async function () {
                  await expect(
                    this.contracts.balanceSheet
                      .connect(this.signers.borrower)
                      .borrow(this.mocks.hTokens[0].address, borrowAmounts[0]),
                  ).to.be.revertedWith(BalanceSheetErrors.LiquidityShortfall);
                });
              });

              context("when the caller deposited collateral", function () {
                beforeEach(async function () {
                  // Mock the necessary methods.
                  await this.mocks.fintroller.mock.getCollateralRatio
                    .withArgs(this.mocks.wbtc.address)
                    .returns(COLLATERAL_RATIOS.wbtc);

                  // Make the collateral deposits.
                  await this.contracts.balanceSheet.__godMode_setCollateralList(this.signers.borrower.address, [
                    this.mocks.wbtc.address,
                  ]);
                  await this.contracts.balanceSheet.__godMode_setCollateralAmount(
                    this.signers.borrower.address,
                    this.mocks.wbtc.address,
                    wbtcDepositAmount,
                  );
                });

                it("reverts", async function () {
                  const ridiculousBorrowAmount: BigNumber = debtCeiling;
                  await expect(
                    this.contracts.balanceSheet
                      .connect(this.signers.borrower)
                      .borrow(this.mocks.hTokens[0].address, ridiculousBorrowAmount),
                  ).to.be.revertedWith(BalanceSheetErrors.LiquidityShortfall);
                });
              });
            });

            context("when the caller does not run into a liquidity shortfall", function () {
              beforeEach(async function () {
                // Mock the necessary methods.
                await this.mocks.fintroller.mock.getCollateralRatio
                  .withArgs(this.mocks.wbtc.address)
                  .returns(COLLATERAL_RATIOS.wbtc);
                await this.mocks.fintroller.mock.getCollateralRatio
                  .withArgs(this.mocks.weth.address)
                  .returns(COLLATERAL_RATIOS.weth);

                // Make the collateral deposits.
                await this.contracts.balanceSheet.__godMode_setCollateralList(this.signers.borrower.address, [
                  this.mocks.wbtc.address,
                  this.mocks.weth.address,
                ]);
                await this.contracts.balanceSheet.__godMode_setCollateralAmount(
                  this.signers.borrower.address,
                  this.mocks.wbtc.address,
                  wbtcDepositAmount,
                );
                await this.contracts.balanceSheet.__godMode_setCollateralAmount(
                  this.signers.borrower.address,
                  this.mocks.weth.address,
                  wethDepositAmount,
                );
              });

              context("when it is the first borrow of the user", function () {
                beforeEach(async function () {
                  // Mock the necessary methods.
                  await this.mocks.hTokens[0].mock.mint
                    .withArgs(this.signers.borrower.address, borrowAmounts[0])
                    .returns();
                });

                it("makes the borrow", async function () {
                  await this.contracts.balanceSheet
                    .connect(this.signers.borrower)
                    .borrow(this.mocks.hTokens[0].address, borrowAmounts[0]);

                  const bondList: string[] = await this.contracts.balanceSheet.getBondList(
                    this.signers.borrower.address,
                  );
                  expect(bondList).to.have.same.members([this.mocks.hTokens[0].address]);

                  const debtAmount: BigNumber = await this.contracts.balanceSheet.getDebtAmount(
                    this.signers.borrower.address,
                    this.mocks.hTokens[0].address,
                  );
                  expect(debtAmount).to.equal(borrowAmounts[0]);
                });
              });

              context("when it is the second borrow of the user", function () {
                beforeEach(async function () {
                  // Mock the necessary methods.
                  await this.mocks.hTokens[0].mock.mint
                    .withArgs(this.signers.borrower.address, borrowAmounts[0])
                    .returns();
                  await this.mocks.hTokens[0].mock.mint
                    .withArgs(this.signers.borrower.address, borrowAmounts[1])
                    .returns();

                  // Make the first borrow.
                  await this.contracts.balanceSheet
                    .connect(this.signers.borrower)
                    .borrow(this.mocks.hTokens[0].address, borrowAmounts[0]);
                });

                it("makes the borrow", async function () {
                  await this.contracts.balanceSheet
                    .connect(this.signers.borrower)
                    .borrow(this.mocks.hTokens[0].address, borrowAmounts[1]);
                  const bondList: string[] = await this.contracts.balanceSheet.getBondList(
                    this.signers.borrower.address,
                  );
                  expect(bondList).to.have.same.members([this.mocks.hTokens[0].address]);

                  const debtAmount: BigNumber = await this.contracts.balanceSheet.getDebtAmount(
                    this.signers.borrower.address,
                    this.mocks.hTokens[0].address,
                  );
                  expect(debtAmount).to.equal(borrowAmounts[0].add(borrowAmounts[1]));
                });

                it("emits a Borrow event", async function () {
                  await expect(
                    this.contracts.balanceSheet
                      .connect(this.signers.borrower)
                      .borrow(this.mocks.hTokens[0].address, borrowAmounts[1]),
                  )
                    .to.emit(this.contracts.balanceSheet, "Borrow")
                    .withArgs(this.signers.borrower.address, this.mocks.hTokens[0].address, borrowAmounts[1]);
                });
              });
            });
          });
        });
      });
    });
  });
}
