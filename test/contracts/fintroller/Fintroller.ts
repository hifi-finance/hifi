import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";

import { deployFintroller2, deployYToken } from "../../../dev-utils/deployers";

export function testFintroller(): void {
  describe("Fintroller", function () {
    beforeEach(async function () {
      await deployFintroller2.call(this, this.admin);
      await deployYToken.call(this, this.admin);
    });

    shouldBehaveLikeFintroller();
  });
}
