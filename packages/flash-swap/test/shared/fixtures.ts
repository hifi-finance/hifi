import { Signer } from "@ethersproject/abstract-signer";
import { keccak256 } from "@ethersproject/keccak256";
import { H_TOKEN_MATURITY_ONE_YEAR } from "@hifi/constants";
import { USDC_DECIMALS, USDC_NAME, USDC_SYMBOL, WBTC_DECIMALS, WBTC_NAME, WBTC_SYMBOL } from "@hifi/constants";
import { getHTokenName, getHTokenSymbol } from "@hifi/helpers";
import type { BalanceSheetV2 } from "@hifi/protocol/dist/types/contracts/core/balance-sheet/BalanceSheetV2";
import type { Fintroller } from "@hifi/protocol/dist/types/contracts/core/fintroller/Fintroller";
import type { ChainlinkOperator } from "@hifi/protocol/dist/types/contracts/oracles/ChainlinkOperator";
import UniswapV3FactoryArtifact from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import NonfungibleTokenPositionDescriptorArtifact from "@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json";
import SwapRouterArtifact from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import QuoterArtifact from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import NFTDescriptorArtifact from "@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json";
import { artifacts, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { GodModeErc20 } from "../../src/types/contracts/test/GodModeErc20";
import type { GodModeHToken } from "../../src/types/contracts/test/GodModeHToken";
import type { SimplePriceFeed } from "../../src/types/contracts/test/SimplePriceFeed";
import type { FlashUniswapV2 } from "../../src/types/contracts/uniswap-v2/FlashUniswapV2";
import type { GodModeUniswapV2Factory } from "../../src/types/contracts/uniswap-v2/test/GodModeUniswapV2Factory";
import type { GodModeUniswapV2Pair } from "../../src/types/contracts/uniswap-v2/test/GodModeUniswapV2Pair";
import type { MaliciousPair as MaliciousV2Pair } from "../../src/types/contracts/uniswap-v2/test/MaliciousPair";
import type { FlashUniswapV3 } from "../../src/types/contracts/uniswap-v3/FlashUniswapV3";
import type { UniswapV3Pool } from "../../src/types/contracts/uniswap-v3/UniswapV3Pool";
import type { MaliciousPool as MaliciousV3Pool } from "../../src/types/contracts/uniswap-v3/test/MaliciousPool";
import type { NonfungiblePositionManager } from "../../src/types/contracts/uniswap-v3/test/NonfungiblePositionManager";
import type { PoolAddressMock } from "../../src/types/contracts/uniswap-v3/test/PoolAddressMock";
import type { WETH9 } from "../../src/types/contracts/uniswap-v3/test/WETH9";
import { GodModeUniswapV2Pair__factory } from "../../src/types/factories/contracts/uniswap-v2/test/GodModeUniswapV2Pair__factory";
import { UniswapV3Pool__factory } from "../../src/types/factories/contracts/uniswap-v3/UniswapV3Pool__factory";
import { createUniswapV3Pool, deployGodModeErc20 } from "./deployers";
import { linkLibraries } from "./linkLibraries";

type IntegrationFixtureReturnType = {
  balanceSheet: BalanceSheetV2;
  fintroller: Fintroller;
  flashUniswapV2: FlashUniswapV2;
  flashUniswapV3: FlashUniswapV3;
  hToken: GodModeHToken;
  maliciousV2Pair: MaliciousV2Pair;
  maliciousV3Pool: MaliciousV3Pool;
  oracle: ChainlinkOperator;
  poolAddress: PoolAddressMock;
  uniswapV2Pair: GodModeUniswapV2Pair;
  uniswapV3Pool: UniswapV3Pool;
  usdc: GodModeErc20;
  usdcPriceFeed: SimplePriceFeed;
  wbtc: GodModeErc20;
  wbtcPriceFeed: SimplePriceFeed;
  nonfungiblePositionManager: NonfungiblePositionManager;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const wbtc: GodModeErc20 = await deployGodModeErc20(deployer, WBTC_NAME, WBTC_SYMBOL, WBTC_DECIMALS);
  const usdc: GodModeErc20 = await deployGodModeErc20(deployer, USDC_NAME, USDC_SYMBOL, USDC_DECIMALS);

  const simplePriceFeedArtifact: Artifact = await artifacts.readArtifact("SimplePriceFeed");
  const wbtcPriceFeed: SimplePriceFeed = <SimplePriceFeed>(
    await waffle.deployContract(deployer, simplePriceFeedArtifact, [])
  );
  const usdcPriceFeed: SimplePriceFeed = <SimplePriceFeed>(
    await waffle.deployContract(deployer, simplePriceFeedArtifact, [])
  );

  const chainlinkOperatorArtifact: Artifact = await artifacts.readArtifact("ChainlinkOperator");
  const oracle: ChainlinkOperator = <ChainlinkOperator>(
    await waffle.deployContract(deployer, chainlinkOperatorArtifact, [])
  );
  await oracle.setFeed(wbtc.address, wbtcPriceFeed.address);
  await oracle.setFeed(usdc.address, usdcPriceFeed.address);

  const fintrollerArtifact: Artifact = await artifacts.readArtifact("Fintroller");
  const fintroller: Fintroller = <Fintroller>await waffle.deployContract(deployer, fintrollerArtifact, []);

  const balanceSheetV2Artifact: Artifact = await artifacts.readArtifact("BalanceSheetV2");
  const balanceSheet: BalanceSheetV2 = <BalanceSheetV2>(
    await waffle.deployContract(deployer, balanceSheetV2Artifact, [])
  );
  await balanceSheet.connect(deployer).initialize(fintroller.address, oracle.address);

  const godModeHTokenArtifact: Artifact = await artifacts.readArtifact("GodModeHToken");
  const hToken: GodModeHToken = <GodModeHToken>(
    await waffle.deployContract(deployer, godModeHTokenArtifact, [
      getHTokenName(H_TOKEN_MATURITY_ONE_YEAR),
      getHTokenSymbol(H_TOKEN_MATURITY_ONE_YEAR),
      H_TOKEN_MATURITY_ONE_YEAR,
      balanceSheet.address,
      fintroller.address,
      usdc.address,
    ])
  );

  const godModeUniswapV2FactoryArtifact: Artifact = await artifacts.readArtifact("GodModeUniswapV2Factory");
  const uniswapV2Factory: GodModeUniswapV2Factory = <GodModeUniswapV2Factory>(
    await waffle.deployContract(deployer, godModeUniswapV2FactoryArtifact, [await deployer.getAddress()])
  );
  await uniswapV2Factory.createPair(wbtc.address, usdc.address);
  const v2PairAddress: string = await uniswapV2Factory.allPairs(0);

  const godModeUniswapV2PairArtifact: Artifact = await artifacts.readArtifact("GodModeUniswapV2Pair");
  const uniswapV2Pair: GodModeUniswapV2Pair = GodModeUniswapV2Pair__factory.connect(v2PairAddress, deployer);

  const maliciousV2PairArtifact: Artifact = await artifacts.readArtifact("MaliciousPair");
  const maliciousV2Pair: MaliciousV2Pair = <MaliciousV2Pair>(
    await waffle.deployContract(deployer, maliciousV2PairArtifact, [wbtc.address, usdc.address])
  );

  const uniV2PairInitCodeHash: string = keccak256(godModeUniswapV2PairArtifact.bytecode);

  const flashUniswapV2Artifact: Artifact = await artifacts.readArtifact("FlashUniswapV2");
  const flashUniswapV2: FlashUniswapV2 = <FlashUniswapV2>(
    await waffle.deployContract(deployer, flashUniswapV2Artifact, [
      balanceSheet.address,
      uniswapV2Factory.address,
      uniV2PairInitCodeHash,
    ])
  );

  const uniswapV3Factory = await waffle.deployContract(deployer, UniswapV3FactoryArtifact, []);
  const uniswapV3Pool: UniswapV3Pool = await createUniswapV3Pool(
    deployer,
    uniswapV3Factory,
    wbtc.address,
    usdc.address,
    500,
  );

  const maliciousV3PoolArtifact: Artifact = await artifacts.readArtifact("MaliciousPool");
  const maliciousV3Pool: MaliciousV3Pool = <MaliciousV3Pool>(
    await waffle.deployContract(deployer, maliciousV3PoolArtifact, [wbtc.address, usdc.address])
  );

  const wETH9Artifact: Artifact = await artifacts.readArtifact("WETH9");
  const wETH9: WETH9 = <WETH9>await waffle.deployContract(deployer, wETH9Artifact, []);

  const quoter = await waffle.deployContract(deployer, QuoterArtifact, [uniswapV3Factory.address, wETH9.address]);

  const swapRouter = await waffle.deployContract(deployer, SwapRouterArtifact, [
    uniswapV3Factory.address,
    wETH9.address,
  ]);

  const poolAddressMockArtifact: Artifact = await artifacts.readArtifact("PoolAddressMock");
  const poolAddress: PoolAddressMock = <PoolAddressMock>(
    await waffle.deployContract(deployer, poolAddressMockArtifact, [])
  );

  const flashUniswapV3Artifact: Artifact = await artifacts.readArtifact("FlashUniswapV3");
  const flashUniswapV3: FlashUniswapV3 = <FlashUniswapV3>(
    await waffle.deployContract(deployer, flashUniswapV3Artifact, [
      balanceSheet.address,
      uniswapV3Factory.address,
      quoter.address,
      swapRouter.address,
    ])
  );

  const nftDescriptor = await waffle.deployContract(deployer, NFTDescriptorArtifact, []);

  const linkedBytecode = linkLibraries(
    {
      bytecode: NonfungibleTokenPositionDescriptorArtifact.bytecode,
      linkReferences: {
        "NFTDescriptor.sol": {
          NFTDescriptor: [
            {
              length: 20,
              start: 1261,
            },
          ],
        },
      },
    },
    {
      NFTDescriptor: nftDescriptor.address,
    },
  );
  const contractArtifact = { abi: NonfungibleTokenPositionDescriptorArtifact.abi, bytecode: linkedBytecode };
  const nonfungibleTokenPositionDescriptor = await waffle.deployContract(deployer, contractArtifact, [wETH9.address]);

  const nonfungiblePositionManagerArtifact: Artifact = await artifacts.readArtifact("NonfungiblePositionManager");
  const nonfungiblePositionManager: NonfungiblePositionManager = <NonfungiblePositionManager>(
    await waffle.deployContract(deployer, nonfungiblePositionManagerArtifact, [
      uniswapV3Factory.address,
      wETH9.address,
      nonfungibleTokenPositionDescriptor.address,
    ])
  );

  return {
    balanceSheet,
    fintroller,
    flashUniswapV2,
    flashUniswapV3,
    hToken,
    maliciousV2Pair,
    maliciousV3Pool,
    oracle,
    poolAddress,
    uniswapV2Pair,
    uniswapV3Pool,
    usdc,
    usdcPriceFeed,
    wbtc,
    wbtcPriceFeed,
    nonfungiblePositionManager,
  };
}
