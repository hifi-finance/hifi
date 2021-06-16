import shouldBehaveLikeRenounceOwnership from "./effects/renounceOwnership";
import shouldBehaveLikeTransferOwnership from "./effects/transferOwnership";
import shouldBehaveLikeOwnerGetter from "./view/owner";

export function shouldBehaveLikeOwnableUpgradeable(): void {
  describe("View Functions", function () {
    describe("owner", function () {
      shouldBehaveLikeOwnerGetter();
    });
  });

  describe("Effects Functions", function () {
    describe("renounceOwnership", function () {
      shouldBehaveLikeRenounceOwnership();
    });

    describe("transferOwnership", function () {
      shouldBehaveLikeTransferOwnership();
    });
  });
}
