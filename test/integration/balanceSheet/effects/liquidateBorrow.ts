import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import {
  DEFAULT_LIQUIDATION_INCENTIVE,
  WBTC_COLLATERALIZATION_RATIO,
  WBTC_SYMBOL,
} from "../../../../helpers/constants";
import { price, wbtc } from "../../../../helpers/numbers";
import { getSeizableCollateralAmount } from "../../../shared/mirrors";

export default function shouldBehaveLikeLiquidateBorrow(): void {
  const debtCeiling: BigNumber = fp("1e6");
  const borrowAmount: BigNumber = fp("15000");
  const lowWbtcPrice: BigNumber = price("29999");
  const wbtcDepositAmount: BigNumber = wbtc("1");

  const repayAmount: BigNumber = borrowAmount;
  const normalizedLowWbtcPrice: BigNumber = fp("29999");
  const seizedWbtcAmount: BigNumber = getSeizableCollateralAmount(repayAmount, normalizedLowWbtcPrice);

  beforeEach(async function () {
    // List the collateral in the Fintroller.
    await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.contracts.wbtc.address);

    // List the bond in the Fintroller.
    await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.hTokens[0].address);

    // Allow borrows and borrow repays and borrow liquidations.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setBorrowAllowed(this.contracts.hTokens[0].address, true);
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setRepayBorrowAllowed(this.contracts.hTokens[0].address, true);
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setLiquidateBorrowAllowed(this.contracts.hTokens[0].address, true);

    // Set the debt ceiling.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setDebtCeiling(this.contracts.hTokens[0].address, debtCeiling);

    // Set the collateralization ratio.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setCollateralizationRatio(this.contracts.wbtc.address, WBTC_COLLATERALIZATION_RATIO);

    // Set the liquidation incentive.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setLiquidationIncentive(this.contracts.wbtc.address, DEFAULT_LIQUIDATION_INCENTIVE);

    // Mint 1 WBTC and approve the BalanceSheet to spend it.
    await this.contracts.wbtc.mint(this.signers.borrower.address, wbtcDepositAmount);
    await this.contracts.wbtc
      .connect(this.signers.borrower)
      .approve(this.contracts.balanceSheet.address, wbtcDepositAmount);

    // Deposit the 1 WBTC in the BalanceSheet.
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .depositCollateral(this.contracts.wbtc.address, wbtcDepositAmount);

    // Make the borrow.
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .borrow(this.contracts.hTokens[0].address, borrowAmount);

    // Mint hTokens to the liquidator.
    await this.contracts.hTokens[0].__godMode_mint(this.signers.liquidator.address, repayAmount);

    // Lower the price of WBTC so that the borrower can be liquidated.
    await this.contracts.wbtcPriceFeed.setPrice(lowWbtcPrice);
  });

  it("makes the borrow liquidation", async function () {
    await this.contracts.balanceSheet
      .connect(this.signers.liquidator)
      .liquidateBorrow(
        this.signers.borrower.address,
        this.contracts.hTokens[0].address,
        repayAmount,
        this.contracts.wbtc.address,
      );

    const collateralList: string[] = await this.contracts.balanceSheet.getCollateralList(this.signers.borrower.address);
    expect(collateralList).to.have.same.members([this.contracts.wbtc.address]);

    const collateralAmount: BigNumber = await this.contracts.balanceSheet.getCollateralAmount(
      this.signers.borrower.address,
      this.contracts.wbtc.address,
    );
    expect(collateralAmount).to.be.equal(wbtcDepositAmount.sub(seizedWbtcAmount));

    const hTokenBalance: BigNumber = await this.contracts.hTokens[0].balanceOf(this.signers.liquidator.address);
    expect(hTokenBalance).to.equal(Zero);

    const wbtcBalance: BigNumber = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
    expect(wbtcBalance).to.equal(seizedWbtcAmount);
  });

  it("emits a Transfer event", async function () {
    await expect(
      this.contracts.balanceSheet
        .connect(this.signers.liquidator)
        .liquidateBorrow(
          this.signers.borrower.address,
          this.contracts.hTokens[0].address,
          repayAmount,
          this.contracts.wbtc.address,
        ),
    )
      .to.emit(this.contracts.wbtc, "Transfer")
      .withArgs(this.contracts.balanceSheet.address, this.signers.liquidator.address, seizedWbtcAmount);
  });
}
