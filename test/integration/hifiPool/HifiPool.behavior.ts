import shouldBehaveLikeHToken from "./effects/buyHToken";
import shouldBehaveLikeBuyUnderlying from "./effects/buyUnderlying";
import shouldBehaveLikeSellHToken from "./effects/sellHToken";

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
  });
}
