import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { COLLATERAL_RATIOS } from "@hifi/constants";
import { WBTC, WETH, hUSDC } from "@hifi/helpers";
import { expect } from "chai";

import { getHypotheticalAccountLiquidity } from "../../../shared/mirrors";

export default function shouldBehaveLikeGetCurrentAccountLiquidity(): void {
  context("when no deposit was made", function () {
    it("returns (0,0)", async function () {
      const result = await this.contracts.balanceSheet.getCurrentAccountLiquidity(this.signers.borrower.address);
      expect(result.excessLiquidity).to.equal(Zero);
      expect(result.shortfallLiquidity).to.equal(Zero);
    });
  });

  context("when two deposits were made", function () {
    const wbtcDepositAmount: BigNumber = WBTC("1");
    const wethDepositAmount: BigNumber = WETH("10");

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

    context("when no borrow was made", function () {
      it("returns the correct values", async function () {
        const result = await this.contracts.balanceSheet.getCurrentAccountLiquidity(this.signers.borrower.address);
        const expected = getHypotheticalAccountLiquidity([wbtcDepositAmount, wethDepositAmount], []);
        expect(result.excessLiquidity).to.equal(expected.excessLiquidity);
        expect(result.shortfallLiquidity).to.equal(expected.shortfallLiquidity);
      });
    });

    context("when two borrows were made", function () {
      const debtAmounts: BigNumber[] = [hUSDC("15000"), hUSDC("20000")];

      beforeEach(async function () {
        await this.contracts.balanceSheet.__godMode_setBondList(this.signers.borrower.address, [
          this.mocks.hTokens[0].address,
          this.mocks.hTokens[1].address,
        ]);
        await this.contracts.balanceSheet.__godMode_setDebtAmount(
          this.signers.borrower.address,
          this.mocks.hTokens[0].address,
          debtAmounts[0],
        );
        await this.contracts.balanceSheet.__godMode_setDebtAmount(
          this.signers.borrower.address,
          this.mocks.hTokens[1].address,
          debtAmounts[1],
        );
      });

      it("returns the correct values", async function () {
        const result = await this.contracts.balanceSheet.getCurrentAccountLiquidity(this.signers.borrower.address);
        const expected = getHypotheticalAccountLiquidity([wbtcDepositAmount, wethDepositAmount], debtAmounts);
        expect(result.excessLiquidity).to.equal(expected.excessLiquidity);
        expect(result.shortfallLiquidity).to.equal(expected.shortfallLiquidity);
      });
    });
  });
}
