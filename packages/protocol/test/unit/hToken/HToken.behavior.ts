import { shouldBehaveLikeConstructor } from "./deployment/constructor";
import { shouldBehaveLikeBurn } from "./effects/burn";
import { shouldBehaveLikeDepositUnderlying } from "./effects/depositUnderlying";
import { shouldBehaveLikeMint } from "./effects/mint";
import { shouldBehaveLikeRedeem } from "./effects/redeem";
import { shouldBehaveLikeSetBalanceSheet } from "./effects/setBalanceSheet";
import { shouldBehaveLikeWithdrawUnderlying } from "./effects/withdrawUnderlying";
import { shouldBehaveLikeBalanceSheetGetter } from "./view/balanceSheet";
import { shouldBehaveLikeIsMatured } from "./view/isMatured";
import { shouldBehaveLikeMaturityGetter } from "./view/maturity";
import { shouldBehaveLikeNonRecoverableTokensGetter } from "./view/nonRecoverableTokens";
import { shouldBehaveLikeTotalUnderlyingReserveGetter } from "./view/totalUnderlyingReserve";
import { shouldBehaveLikeUnderlyingGetter } from "./view/underlying";
import { shouldBehaveLikeUnderlyingPrecisionScalarGetter } from "./view/underlyingPrecisionScalar";

export function shouldBehaveLikeHToken(): void {
  describe("Deployment", function () {
    describe("constructor", function () {
      shouldBehaveLikeConstructor();
    });
  });

  describe("View Functions", function () {
    describe("balanceSheet", function () {
      shouldBehaveLikeBalanceSheetGetter();
    });

    describe("isMatured", function () {
      shouldBehaveLikeIsMatured();
    });

    describe("maturity", function () {
      shouldBehaveLikeMaturityGetter();
    });

    describe("nonRecoverableTokens", function () {
      shouldBehaveLikeNonRecoverableTokensGetter();
    });

    describe("totalUnderlyingReserve", function () {
      shouldBehaveLikeTotalUnderlyingReserveGetter();
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

    describe("depositUnderlying", function () {
      shouldBehaveLikeDepositUnderlying();
    });

    describe("mint", function () {
      shouldBehaveLikeMint();
    });

    describe("redeem", function () {
      shouldBehaveLikeRedeem();
    });

    describe("setBalanceSheet", function () {
      shouldBehaveLikeSetBalanceSheet();
    });

    describe("withdrawUnderlying", function () {
      shouldBehaveLikeWithdrawUnderlying();
    });
  });
}
