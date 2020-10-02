import { erc20PermitFixture, loadFixture } from "../../fixtures";
import { shouldBehaveLikeErc20Permit } from "./Erc20Permit.behavior";

export function testErc20Permit(): void {
  describe.only("Erc20 Permit", function () {
    beforeEach(async function () {
      const { erc20Permit } = await loadFixture.call(this)(erc20PermitFixture);
      this.contracts.erc20Permit = erc20Permit;
    });

    shouldBehaveLikeErc20Permit();
  });
}
