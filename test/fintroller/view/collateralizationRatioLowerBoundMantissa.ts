import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { FintrollerConstants } from "../../../utils/constants";

export default function shouldBehaveLikeCollateralizationRatioLowerBoundMantissaGetter(): void {
  it("retrieve the collateralization ratio lower bound mantissa", async function () {
    const collateralizationRatioLowerBoundMantissa: BigNumber = await this.contracts.fintroller.collateralizationRatioLowerBoundMantissa();
    expect(collateralizationRatioLowerBoundMantissa).to.equal(
      FintrollerConstants.CollateralizationRatioLowerBoundMantissa,
    );
  });
}
