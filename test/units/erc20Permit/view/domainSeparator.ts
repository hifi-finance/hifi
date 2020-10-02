import bre from "@nomiclabs/buidler";
import { expect } from "chai";

import { BuidlerEvmChainId, Erc20PermitConstants } from "../../../helpers/constants";
import { getDomainSeparator } from "../../../helpers/eip2612";

export default function shouldBehaveLikePermitTypehashGetter(): void {
  it("retrieves the proper domain separator", async function () {
    const contractDomainSeparator: string = await this.contracts.erc20Permit.DOMAIN_SEPARATOR();
    const domainSeparator = getDomainSeparator(
      Erc20PermitConstants.name,
      bre.network.config.chainId || BuidlerEvmChainId.toNumber(),
      this.contracts.erc20Permit.address,
    );
    expect(contractDomainSeparator).to.equal(domainSeparator);
  });
}
