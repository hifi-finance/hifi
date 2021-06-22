import shouldBehaveLikeSellHToken from "./effects/sellHToken";

export function shouldBehaveLikeHifiPool(): void {
  describe("Effects Functions", function () {
    describe("sellHToken", function () {
      shouldBehaveLikeSellHToken();
    });
  });
}
