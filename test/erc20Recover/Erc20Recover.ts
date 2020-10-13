import { erc20RecoverFixture } from "../fixtures";
import { shouldBehaveLikeErc20Recover } from "./Erc20Recover.behavior";

export function testErc20Recover(): void {
  describe("Erc20 Recover", function () {
    beforeEach(async function () {
      const { collateral, erc20Recover, thirdPartyToken } = await this.loadFixture(erc20RecoverFixture);
      this.contracts.erc20Recover = erc20Recover;
      this.stubs.collateral = collateral;
      this.stubs.thirdPartyToken = thirdPartyToken;
    });

    shouldBehaveLikeErc20Recover();
  });
}
