import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";
import { Zero } from "@ethersproject/constants";
import { waffle } from "@nomiclabs/buidler";

import DumbOracleArtifact from "../../artifacts/DumbOracle.json";
import Erc20MintableArtifact from "../../artifacts/Erc20Mintable.json";
import FintrollerArtifact from "../../artifacts/Fintroller.json";
import GuarantorPoolArtifact from "../../artifacts/GuarantorPool.json";
import YTokenArtifact from "../../artifacts/YToken.json";

const { deployMockContract: deployStubContract } = waffle;

export async function deployStubCollateral(deployer: Signer): Promise<MockContract> {
  const collateral: MockContract = await deployStubContract(deployer, Erc20MintableArtifact.abi);
  await collateral.mock.decimals.returns(BigNumber.from(18));
  await collateral.mock.name.returns("Wrapped Ether");
  await collateral.mock.symbol.returns("WETH");
  await collateral.mock.totalSupply.returns(Zero);
  return collateral;
}

export async function deployStubFintroller(deployer: Signer): Promise<MockContract> {
  const fintroller: MockContract = await deployStubContract(deployer, FintrollerArtifact.abi);
  return fintroller;
}

export async function deployStubGuarantorPool(deployer: Signer): Promise<MockContract> {
  const guarantorPool: MockContract = await deployStubContract(deployer, GuarantorPoolArtifact.abi);
  await guarantorPool.mock.decimals.returns(BigNumber.from(18));
  await guarantorPool.mock.name.returns("Mainframe Guarantor Pool Shares");
  await guarantorPool.mock.symbol.returns("MGP-SHARES");
  await guarantorPool.mock.totalSupply.returns(Zero);
  return guarantorPool;
}

export async function deployStubOracle(deployer: Signer): Promise<MockContract> {
  const oracle: MockContract = await deployStubContract(deployer, DumbOracleArtifact.abi);
  await oracle.mock.getEthPriceInUsd.returns(BigNumber.from(100));
  await oracle.mock.getDaiPriceInUsd.returns(BigNumber.from(1));
  return oracle;
}

export async function deployStubUnderlying(deployer: Signer): Promise<MockContract> {
  const underlying: MockContract = await deployStubContract(deployer, Erc20MintableArtifact.abi);
  await underlying.mock.decimals.returns(BigNumber.from(18));
  await underlying.mock.name.returns("Wrapped Ether");
  await underlying.mock.symbol.returns("WETH");
  await underlying.mock.totalSupply.returns(Zero);
  return underlying;
}

export async function deployStubYToken(deployer: Signer): Promise<MockContract> {
  const yToken: MockContract = await deployStubContract(deployer, YTokenArtifact.abi);
  await yToken.mock.isYToken.returns(true);
  return yToken;
}
