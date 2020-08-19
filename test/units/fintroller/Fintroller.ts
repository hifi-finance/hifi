import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";

import { deployFintroller, deployYToken } from "../../helpers/deployers";

export function testFintroller(): void {
  describe("Fintroller", function () {
    beforeEach(async function () {
      await deployFintroller.call(this, this.admin);
      await deployYToken.call(this, this.admin);
    });

    shouldBehaveLikeFintroller();
  });
}
