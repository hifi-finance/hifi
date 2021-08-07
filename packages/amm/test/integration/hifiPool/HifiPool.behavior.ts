import shouldBehaveLikeHToken from "./effects/buyHToken";
import shouldBehaveLikeBuyUnderlying from "./effects/buyUnderlying";
import shouldBehaveLikeSellHToken from "./effects/sellHToken";
import shouldBehaveLikeSellUnderlying from "./effects/sellUnderlying";

export function shouldBehaveLikeHifiPool(): void {
  describe("Effects Functions", function () {
    describe("buyHToken", function () {
      shouldBehaveLikeHToken();
    });

    describe("buyUnderlying", function () {
      shouldBehaveLikeBuyUnderlying();
    });

    describe("sellHToken", function () {
      shouldBehaveLikeSellHToken();
    });

    describe("sellUnderlying", function () {
      shouldBehaveLikeSellUnderlying();
    });
  });
}
