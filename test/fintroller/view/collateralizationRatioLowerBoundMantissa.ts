import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { FintrollerConstants } from "../../../constants";

export default function shouldBehaveLikeCollateralizationRatioLowerBoundMantissaGetter(): void {
  it("should retrieve the collateralization ratio lower bound mantissa", async function () {
    const collateralizationRatioLowerBoundMantissa: BigNumber = await this.fintroller.collateralizationRatioLowerBoundMantissa();
    expect(collateralizationRatioLowerBoundMantissa).to.equal(
      FintrollerConstants.CollateralizationRatioLowerBoundMantissa,
    );
  });
}
