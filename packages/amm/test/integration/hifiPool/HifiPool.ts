import { MAX_UD60x18 } from "@hifi/constants";
import fp from "evm-fp";

import { integrationFixtureHifiPool } from "../../shared/fixtures";
import { shouldBehaveLikeHifiPool } from "./HifiPool.behavior";

export function integrationTestHifiPool(): void {
  describe("HifiPool", function () {
    beforeEach(async function () {
      const { hToken, hifiPool, underlying } = await this.loadFixture(integrationFixtureHifiPool);
      this.contracts.hifiPool = hifiPool;
      this.contracts.hToken = hToken;
      this.contracts.underlying = underlying;

      // Give Alice an infinite amount of hTokens and underlying.
      await this.contracts.hToken.__godMode_mint(this.signers.alice.address, fp(MAX_UD60x18));
      await this.contracts.underlying.__godMode_mint(this.signers.alice.address, fp(MAX_UD60x18));

      // Approve the pool to spend an infinite amount of hTokens and underlying from Alice's wallet.
      await this.contracts.hToken.connect(this.signers.alice).approve(this.contracts.hifiPool.address, fp(MAX_UD60x18));
      await this.contracts.underlying
        .connect(this.signers.alice)
        .approve(this.contracts.hifiPool.address, fp(MAX_UD60x18));
    });

    shouldBehaveLikeHifiPool();
  });
}
