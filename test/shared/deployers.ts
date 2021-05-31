import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import { USDC_DECIMALS, USDC_NAME, USDC_SYMBOL } from "../../helpers/constants";
import { getHTokenName, getHTokenSymbol } from "../../helpers/contracts";
import { getDeployContractOverrides } from "../../helpers/env";
import { price } from "../../helpers/numbers";
import { ChainlinkOperator } from "../../typechain/ChainlinkOperator";
import { Erc20Mintable } from "../../typechain/Erc20Mintable";
import { Fintroller } from "../../typechain/Fintroller";
import { GodModeBalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeHToken } from "../../typechain/GodModeHToken";
import { HToken } from "../../typechain/HToken";
import { SimplePriceFeed } from "../../typechain/SimplePriceFeed";

const { deployContract } = hre.waffle;

export async function deployChainlinkOperator(deployer: Signer): Promise<ChainlinkOperator> {
  const chainlinkOperatorArtifact: Artifact = await hre.artifacts.readArtifact("ChainlinkOperator");
  const chainlinkOperator: ChainlinkOperator = <ChainlinkOperator>(
    await deployContract(deployer, chainlinkOperatorArtifact, [], getDeployContractOverrides())
  );
  return chainlinkOperator;
}

export async function deployFintroller(deployer: Signer): Promise<Fintroller> {
  const fintrollerArtifact: Artifact = await hre.artifacts.readArtifact("Fintroller");
  const fintroller: Fintroller = <Fintroller>(
    await deployContract(deployer, fintrollerArtifact, [], getDeployContractOverrides())
  );
  return fintroller;
}

export async function deployHToken(
  deployer: Signer,
  expirationTime: BigNumber,
  balanceSheetAddress: string,
  underlyingAddress: string,
): Promise<HToken> {
  const hTokenArtifact: Artifact = await hre.artifacts.readArtifact("HToken");
  const hToken: HToken = <HToken>(
    await deployContract(
      deployer,
      hTokenArtifact,
      [
        getHTokenName(expirationTime),
        getHTokenSymbol(expirationTime),
        expirationTime,
        balanceSheetAddress,
        underlyingAddress,
      ],
      getDeployContractOverrides(),
    )
  );
  return hToken;
}

export async function deployGodModeBalanceSheet(
  deployer: Signer,
  fintrollerAddress: string,
  oracleAddress: string,
): Promise<GodModeBalanceSheet> {
  const godModeBalanceSheetArtifact: Artifact = await hre.artifacts.readArtifact("GodModeBalanceSheet");
  const balanceSheet: GodModeBalanceSheet = <GodModeBalanceSheet>(
    await deployContract(
      deployer,
      godModeBalanceSheetArtifact,
      [fintrollerAddress, oracleAddress],
      getDeployContractOverrides(),
    )
  );
  return balanceSheet;
}

export async function deployGodModeHToken(
  deployer: Signer,
  expirationTime: BigNumber,
  balanceSheetAddress: string,
  underlyingAddress: string,
): Promise<GodModeHToken> {
  const godModeHTokenArtifact: Artifact = await hre.artifacts.readArtifact("GodModeHToken");
  const hToken: GodModeHToken = <GodModeHToken>(
    await deployContract(
      deployer,
      godModeHTokenArtifact,
      [
        getHTokenName(expirationTime),
        getHTokenSymbol(expirationTime),
        expirationTime,
        balanceSheetAddress,
        underlyingAddress,
      ],
      getDeployContractOverrides(),
    )
  );
  return hToken;
}

export async function deploySimplePriceFeed(
  deployer: Signer,
  description: string,
  price: BigNumber,
): Promise<SimplePriceFeed> {
  const simplePriceFeedArtifact: Artifact = await hre.artifacts.readArtifact("SimplePriceFeed");
  const simplePriceFeed: SimplePriceFeed = <SimplePriceFeed>(
    await deployContract(deployer, simplePriceFeedArtifact, [description], getDeployContractOverrides())
  );
  await simplePriceFeed.setPrice(price);
  return simplePriceFeed;
}

export async function deployUsdc(deployer: Signer): Promise<Erc20Mintable> {
  const erc20MintableArtifact: Artifact = await hre.artifacts.readArtifact("Erc20Mintable");
  const usdc: Erc20Mintable = <Erc20Mintable>(
    await deployContract(
      deployer,
      erc20MintableArtifact,
      [USDC_NAME, USDC_SYMBOL, USDC_DECIMALS],
      getDeployContractOverrides(),
    )
  );
  return usdc;
}

export async function deployUsdcPriceFeed(deployer: Signer): Promise<SimplePriceFeed> {
  const simplePriceFeedArtifact: Artifact = await hre.artifacts.readArtifact("SimplePriceFeed");
  const underlyingPriceFeed: SimplePriceFeed = <SimplePriceFeed>(
    await deployContract(deployer, simplePriceFeedArtifact, ["USDC/USD"], getDeployContractOverrides())
  );
  await underlyingPriceFeed.setPrice(price("1"));
  return underlyingPriceFeed;
}
