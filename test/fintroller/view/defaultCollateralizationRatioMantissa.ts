import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { FintrollerConstants } from "../../../constants";

export default function shouldBehaveLikeDefaultCollateralizationRatioMantissaGetter(): void {
  it("should retrieve the default collateralization ratio mantissa", async function () {
    const collateralizationRatioDefaultMantissa: BigNumber = await this.fintroller.defaultCollateralizationRatioMantissa();
    expect(collateralizationRatioDefaultMantissa).to.equal(FintrollerConstants.DefaultCollateralizationRatioMantissa);
  });
}
