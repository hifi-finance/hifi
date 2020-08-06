import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { FintrollerConstants } from "../../../constants";

export default function shouldBehaveLikeCollateralizationRatioUpperBoundMantissaGetter(): void {
  it("should retrieve the collateralization ratio upper bound mantissa", async function () {
    const collateralizationRatioUpperBoundMantissa: BigNumber = await this.fintroller.collateralizationRatioUpperBoundMantissa();
    expect(collateralizationRatioUpperBoundMantissa).to.equal(
      FintrollerConstants.CollateralizationRatioUpperBoundMantissa,
    );
  });
}
