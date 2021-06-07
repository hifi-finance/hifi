import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import { WBTC_COLLATERALIZATION_RATIO, WETH_COLLATERALIZATION_RATIO } from "../../../../helpers/constants";
import { wbtc, weth } from "../../../../helpers/numbers";
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
    const wbtcAmount: BigNumber = wbtc("1");
    const wethAmount: BigNumber = weth("10");

    beforeEach(async function () {
      // Mocks the necessary methods.
      await this.mocks.fintroller.mock.getCollateralizationRatio
        .withArgs(this.mocks.wbtc.address)
        .returns(WBTC_COLLATERALIZATION_RATIO);
      await this.mocks.fintroller.mock.getCollateralizationRatio
        .withArgs(this.mocks.weth.address)
        .returns(WETH_COLLATERALIZATION_RATIO);

      // Make the collateral deposits.
      await this.contracts.balanceSheet.__godMode_setCollateralList(this.signers.borrower.address, [
        this.mocks.wbtc.address,
        this.mocks.weth.address,
      ]);
      await this.contracts.balanceSheet.__godMode_setCollateralAmount(
        this.signers.borrower.address,
        this.mocks.wbtc.address,
        wbtcAmount,
      );
      await this.contracts.balanceSheet.__godMode_setCollateralAmount(
        this.signers.borrower.address,
        this.mocks.weth.address,
        wethAmount,
      );
    });

    context("when no borrow was made", function () {
      it("returns the correct values", async function () {
        const result = await this.contracts.balanceSheet.getCurrentAccountLiquidity(this.signers.borrower.address);
        const expected = getHypotheticalAccountLiquidity([wbtcAmount, wethAmount], []);
        expect(result.excessLiquidity).to.equal(expected.excessLiquidity);
        expect(result.shortfallLiquidity).to.equal(expected.shortfallLiquidity);
      });
    });

    context("when two borrows were made", function () {
      const debtAmounts: BigNumber[] = [fp("15000"), fp("20000")];

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
        const expected = getHypotheticalAccountLiquidity([wbtcAmount, wethAmount], debtAmounts);
        expect(result.excessLiquidity).to.equal(expected.excessLiquidity);
        expect(result.shortfallLiquidity).to.equal(expected.shortfallLiquidity);
      });
    });
  });
}
