import shouldBehaveLikeDepositCollateral from "./effects/depositCollateral";

export function shouldBehaveLikeBalanceSheet(): void {
  describe("Effects Functions", function () {
    describe("depositCollateral", function () {
      shouldBehaveLikeDepositCollateral();
    });
  });
}
