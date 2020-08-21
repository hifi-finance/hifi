import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { FintrollerConstants } from "../../../helpers/constants";

export default function shouldBehaveLikeDefaultCollateralizationRatioMantissaGetter(): void {
  it("retrieve the default collateralization ratio mantissa", async function () {
    const collateralizationRatioDefaultMantissa: BigNumber = await this.contracts.fintroller.defaultCollateralizationRatioMantissa();
    expect(collateralizationRatioDefaultMantissa).to.equal(FintrollerConstants.DefaultCollateralizationRatioMantissa);
  });
}
