import bre from "@nomiclabs/buidler";
import { BigNumber } from "@ethersproject/bignumber";
import { SigningKey } from "@ethersproject/signing-key";
// import { expect } from "chai";
import { keccak256 } from "@ethersproject/keccak256";

import { BuidlerEvmChainId, Erc20PermitConstants } from "../../../helpers/constants";
import { getPermitDigest, sign } from "../../../helpers/eip2612";

export default function shouldBehaveLikePermit(): void {
  it.only("lets the spender claim the allowance signed by the owner", async function () {
    /* December 31, 2099 at 16:00 GMT */
    const deadline: BigNumber = BigNumber.from(4102416000);

    /* Get the user's nonce. */
    const nonce: BigNumber = BigNumber.from(await this.contracts.erc20Permit.nonces(this.accounts.brad));

    /* Create the approval request. */
    const approve = {
      owner: this.accounts.brad,
      spender: this.accounts.admin,
      amount: BigNumber.from(100),
    };

    /* Get the EIP712 digest. */
    console.log("bre.network.config.chainId", bre.network.config.chainId);
    const digest: string = await getPermitDigest(
      this.contracts.erc20Permit,
      bre.network.config.chainId ? BigNumber.from(bre.network.config.chainId) : BuidlerEvmChainId,
      approve,
      nonce,
      deadline,
    );

    /* Sign the digest. */
    const bradPrivateKey: string = "0xd49743deccbccc5dc7baa8e69e5be03298da8688a15dd202e20f15d5e0e9a9fb";
    console.log({
      admin: {
        account: this.accounts.admin,
        privateKey: "0xc5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122",
      },
      brad: {
        account: this.accounts.brad,
        privateKey: bradPrivateKey,
      },
    });

    const foo = sign(digest, Buffer.from(bradPrivateKey.slice(2), "hex"));
    const bradSigningKey = new SigningKey(bradPrivateKey);
    const bar = bradSigningKey.signDigest(digest);

    // console.log({
    //   foo: "0x" + foo.r.toString("hex") + foo.s.toString("hex") + foo.v.toString(16),
    //   bar: bar.r + bar.s.slice(2) + bar.v.toString(16),
    // });

    /* Approve it. */
    // const v: number = 27;
    // const r: string = "0xee67163f3c9910939a6b45bc201d9b772186037b5b249e4956b24eb5ad3ce379";
    // const s: string = "0x5c56679a934a2e8d245177dfb021c621e40119373072f0d5d0a0909ff0e141aa";
    // const receipt = await this.contracts.erc20Permit
    //   .connect(this.signers.admin)
    //   .permit(approve.owner, approve.spender, approve.amount, deadline, foo.v, foo.r, foo.s);

    // console.log({ receipt });
  });
}
