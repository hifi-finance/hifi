import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeLiquidationIncentiveMantissaGetter(): void {
  it("retrieves the default value", async function () {
    const liquidationIncentiveMantissa: BigNumber = await this.contracts.fintroller.liquidationIncentiveMantissa();
    expect(liquidationIncentiveMantissa).to.equal(Zero);
  });
}
