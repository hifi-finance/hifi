import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { percentages } from "../../../../helpers/constants";

export default function shouldBehaveLikeLiquidationIncentiveMantissaGetter(): void {
  it("retrieves the default value", async function () {
    const liquidationIncentiveMantissa: BigNumber = await this.contracts.fintroller.liquidationIncentiveMantissa();
    expect(liquidationIncentiveMantissa).to.equal(percentages.oneHundredAndTen);
  });
}
