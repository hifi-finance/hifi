import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";
import { waffle } from "@nomiclabs/buidler";

import FintrollerArtifact from "../../artifacts/Fintroller.json";
import YTokenArtifact from "../../artifacts/YToken.json";

import { DefaultBlockGasLimit } from "./constants";
import { Fintroller } from "../../typechain/Fintroller";
import { YToken } from "../../typechain/YToken";

import {
  deployStubCollateral,
  deployStubGuarantorPool,
  deployStubUnderlying,
  deployStubFintroller,
  deployStubOracle,
} from "./stubs";

const { deployContract } = waffle;

export async function fintrollerFixture(signers: Signer[]): Promise<{ fintroller: Fintroller }> {
  const fintroller: Fintroller = ((await deployContract(signers[0], FintrollerArtifact, [])) as unknown) as Fintroller;
  return { fintroller };
}

export async function yTokenFixture(
  signers: Signer[],
): Promise<{
  collateral: MockContract;
  fintroller: MockContract;
  guarantorPool: MockContract;
  oracle: MockContract;
  underlying: MockContract;
  yToken: YToken;
}> {
  const deployer: Signer = signers[0];

  /* TODO: handle the case when the oracle isn't set. */
  const fintroller: MockContract = await deployStubFintroller(deployer);
  const oracle: MockContract = await deployStubOracle(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  const underlying: MockContract = await deployStubUnderlying(deployer);
  const collateral: MockContract = await deployStubCollateral(deployer);
  const guarantorPool: MockContract = await deployStubGuarantorPool(deployer);

  const name: string = "DAI/ETH (2021-01-01)";
  const symbol: string = "yDAI-JAN21";
  const decimals: BigNumber = BigNumber.from(18);
  /* December 31, 2020 at 23:59:59 */
  const expirationTime: BigNumber = BigNumber.from(1609459199);

  const yToken: YToken = ((await deployContract(
    deployer,
    YTokenArtifact,
    [
      name,
      symbol,
      decimals,
      fintroller.address,
      underlying.address,
      collateral.address,
      guarantorPool.address,
      expirationTime,
    ],
    { gasLimit: DefaultBlockGasLimit },
  )) as unknown) as YToken;

  return { collateral, fintroller, guarantorPool, oracle, underlying, yToken };
}
