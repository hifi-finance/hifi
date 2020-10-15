import { BigNumber } from "@ethersproject/bignumber";
import { Signer } from "@ethersproject/abstract-signer";
import { waffle } from "@nomiclabs/buidler";

import BalanceSheetArtifact from "../artifacts/GodModeBalanceSheet.json";
import Erc20MintableArtifact from "../artifacts/Erc20Mintable.json";
import FintrollerArtifact from "../artifacts/Fintroller.json";
import SimpleUniswapAnchoredViewArtifact from "../artifacts/SimpleUniswapAnchoredView.json";
import YTokenArtifact from "../artifacts/GodModeYToken.json";

import { CollateralConstants, UnderlyingConstants, YTokenConstants } from "../helpers/constants";
import { Erc20Mintable } from "../typechain/Erc20Mintable";
import { Fintroller } from "../typechain/Fintroller";
import { GodModeBalanceSheet as BalanceSheet } from "../typechain/GodModeBalanceSheet";
import { GodModeYToken as YToken } from "../typechain/GodModeYToken";
import { SimpleUniswapAnchoredView } from "../typechain/SimpleUniswapAnchoredView";

const { deployContract } = waffle;

export async function deployBalanceSheet(deployer: Signer, fintroller: Fintroller): Promise<BalanceSheet> {
  const balanceSheet: BalanceSheet = ((await deployContract(deployer, BalanceSheetArtifact, [
    fintroller.address,
  ])) as unknown) as BalanceSheet;
  return balanceSheet;
}

export async function deployCollateral(deployer: Signer): Promise<Erc20Mintable> {
  const collateral: Erc20Mintable = ((await deployContract(deployer, Erc20MintableArtifact, [
    CollateralConstants.Name,
    CollateralConstants.Symbol,
    CollateralConstants.Decimals,
  ])) as unknown) as Erc20Mintable;
  return collateral;
}

export async function deployFintroller(deployer: Signer): Promise<Fintroller> {
  const fintroller: Fintroller = ((await deployContract(deployer, FintrollerArtifact, [])) as unknown) as Fintroller;
  return fintroller;
}

export async function deployOracle(deployer: Signer): Promise<SimpleUniswapAnchoredView> {
  const oracle: SimpleUniswapAnchoredView = ((await deployContract(
    deployer,
    SimpleUniswapAnchoredViewArtifact,
    [],
  )) as unknown) as SimpleUniswapAnchoredView;
  return oracle;
}

export async function deployUnderlying(deployer: Signer): Promise<Erc20Mintable> {
  const underlying: Erc20Mintable = ((await deployContract(deployer, Erc20MintableArtifact, [
    UnderlyingConstants.Name,
    UnderlyingConstants.Symbol,
    UnderlyingConstants.Decimals,
  ])) as unknown) as Erc20Mintable;
  return underlying;
}

export async function deployYToken(
  deployer: Signer,
  fintroller: Fintroller,
  balanceSheet: BalanceSheet,
  underlying: Erc20Mintable,
  collateral: Erc20Mintable,
): Promise<YToken> {
  const name: string = YTokenConstants.Name;
  const symbol: string = YTokenConstants.Symbol;
  const expirationTime: BigNumber = YTokenConstants.DefaultExpirationTime; /* December 31, 2020 at 23:59:59 */

  const yToken: YToken = ((await deployContract(deployer, YTokenArtifact, [
    name,
    symbol,
    expirationTime,
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    collateral.address,
  ])) as unknown) as YToken;

  return yToken;
}
