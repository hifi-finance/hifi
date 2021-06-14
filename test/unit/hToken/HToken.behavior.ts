import shouldBehaveLikeConstructor from "./deployment/constructor";
import shouldBehaveLikeBurn from "./effects/burn";
import shouldBehaveLikeMint from "./effects/mint";
import shouldBehaveLikeSetBalanceSheet from "./effects/setBalanceSheet";
import shouldBehaveLikeBalanceSheetGetter from "./view/balanceSheet";
import shouldBehaveLikeExpirationTimeGetter from "./view/expirationTime";
import shouldBehaveLikeIsMatured from "./view/isMatured";
import shouldBehaveLikeUnderlyingGetter from "./view/underlying";
import shouldBehaveLikeUnderlyingPrecisionScalarGetter from "./view/underlyingPrecisionScalar";

export function shouldBehaveLikeHToken(): void {
  describe("Deployment", function () {
    shouldBehaveLikeConstructor();
  });

  describe("View Functions", function () {
    describe("balanceSheet", function () {
      shouldBehaveLikeBalanceSheetGetter();
    });

    describe("expirationTime", function () {
      shouldBehaveLikeExpirationTimeGetter();
    });

    describe("isMatured", function () {
      shouldBehaveLikeIsMatured();
    });

    describe("underlying", function () {
      shouldBehaveLikeUnderlyingGetter();
    });

    describe("underlyingPrecisionScalar", function () {
      shouldBehaveLikeUnderlyingPrecisionScalarGetter();
    });
  });

  describe("Effects Functions", function () {
    describe("burn", function () {
      shouldBehaveLikeBurn();
    });

    describe("mint", function () {
      shouldBehaveLikeMint();
    });

    describe("setBalanceSheet", function () {
      shouldBehaveLikeSetBalanceSheet();
    });
  });
}
