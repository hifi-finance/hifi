import { unitFixtureOwnableUpgradeable } from "../../shared/fixtures";
import { shouldBehaveLikeOwnableUpgradeable } from "./OwnableUpgradeable.behavior";

export function unitTestOwnableUpgradeable(): void {
  describe("OwnableUpgradeable", function () {
    beforeEach(async function () {
      const { ownableUpgradeable } = await this.loadFixture(unitFixtureOwnableUpgradeable);
      this.contracts.ownableUpgradeable = ownableUpgradeable;
    });

    shouldBehaveLikeOwnableUpgradeable();
  });
}
