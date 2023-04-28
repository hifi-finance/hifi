import { AddressZero } from "@ethersproject/constants";
import { CARDINALITY, DEFAULT_TWAP_INTERVAL } from "@hifi/constants";
import { UniswapV3PriceFeedErrors } from "@hifi/errors";
import { expect } from "chai";
import { MockContract } from "ethereum-waffle";
import { Signer } from "ethers";
import { ethers } from "hardhat";

import type { GodModeUniswapV3PriceFeed } from "../../../../../src/types/contracts/test/GodModeUniswapV3PriceFeed";
import { deployUniswapV3PriceFeed } from "../../../../shared/deployers";
import { deployMockUniswapV3Pool, deployMockUsdc, deployMockWbtc, deployMockWeth } from "../../../../shared/mocks";

export function shouldBehaveLikeConstructor(): void {
  let deployer: Signer;
  let pool: MockContract;
  let usdc: MockContract;
  let weth: MockContract;

  beforeEach(async function () {
    deployer = this.signers.admin;
    pool = await deployMockUniswapV3Pool(deployer);
    usdc = await deployMockUsdc(deployer);
    weth = await deployMockWeth(deployer);
  });

  context("when the quote asset is not in the provided pool", function () {
    let wbtc: MockContract;

    beforeEach(async function () {
      wbtc = await deployMockWbtc(deployer);
      await pool.mock.token0.returns(usdc.address);
      await pool.mock.token1.returns(wbtc.address);
    });

    it("reverts", async function () {
      const deployUniswapV3PriceFeedPromise: Promise<GodModeUniswapV3PriceFeed> = deployUniswapV3PriceFeed(
        deployer,
        pool.address,
        weth.address,
        DEFAULT_TWAP_INTERVAL,
      );

      await expect(deployUniswapV3PriceFeedPromise).to.be.revertedWith(
        UniswapV3PriceFeedErrors.QUOTE_ASSET_NOT_IN_POOL,
      );
    });
  });

  context("when the quote asset is in the provided pool", function () {
    let oldestAvailableAge: number;
    let latestObservationIsInitialized: boolean;

    beforeEach(async function () {
      await pool.mock.token0.returns(usdc.address);
      await pool.mock.token1.returns(weth.address);
    });

    context("when the next observation in ring buffer has not been initialized", function () {
      context("when the pool does not have enough TWAP available", function () {
        beforeEach(async function () {
          const currentIndex: number = 0;
          await pool.mock.slot0.returns(0, 0, currentIndex, CARDINALITY, 0, 0, 0);

          const oldestIndex: number = (currentIndex + 1) % CARDINALITY;
          const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
          oldestAvailableAge = timestamp - DEFAULT_TWAP_INTERVAL + 60;
          latestObservationIsInitialized = false;
          await pool.mock.observations
            .withArgs(oldestIndex)
            .returns(oldestAvailableAge, 0, 0, latestObservationIsInitialized);
          const zeroObservationIsInitialized: boolean = true;
          await pool.mock.observations.withArgs(0).returns(oldestAvailableAge, 0, 0, zeroObservationIsInitialized);
        });

        it("reverts", async function () {
          const deployUniswapV3PriceFeedPromise: Promise<GodModeUniswapV3PriceFeed> = deployUniswapV3PriceFeed(
            deployer,
            pool.address,
            usdc.address,
            DEFAULT_TWAP_INTERVAL,
          );

          await expect(deployUniswapV3PriceFeedPromise).to.be.revertedWith(
            UniswapV3PriceFeedErrors.TWAP_CRITERIA_NOT_SATISFIED,
          );
        });
      });

      context("when the pool has enough TWAP available", function () {
        context("when the pool does not have enough cardinality", function () {
          beforeEach(async function () {
            const currentIndex: number = 0;
            await pool.mock.slot0.returns(0, 0, currentIndex, CARDINALITY - 1, 0, 0, 0);

            const oldestIndex: number = (currentIndex + 1) % (CARDINALITY - 1);
            const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
            const oldestAvailableAge: number = timestamp - DEFAULT_TWAP_INTERVAL;
            const latestObservationIsInitialized: boolean = false;
            await pool.mock.observations
              .withArgs(oldestIndex)
              .returns(oldestAvailableAge, 0, 0, latestObservationIsInitialized);
            const zeroObservationIsInitialized: boolean = true;
            await pool.mock.observations.withArgs(0).returns(oldestAvailableAge, 0, 0, zeroObservationIsInitialized);
          });

          it("reverts", async function () {
            const deployUniswapV3PriceFeedPromise: Promise<GodModeUniswapV3PriceFeed> = deployUniswapV3PriceFeed(
              deployer,
              pool.address,
              usdc.address,
              DEFAULT_TWAP_INTERVAL,
            );

            await expect(deployUniswapV3PriceFeedPromise).to.be.revertedWith(
              UniswapV3PriceFeedErrors.TWAP_CRITERIA_NOT_SATISFIED,
            );
          });
        });
      });
    });

    context("when the next observation in ring buffer has been initialized", function () {
      context("when the pool does not have enough TWAP available", function () {
        beforeEach(async function () {
          const currentIndex: number = 0;
          await pool.mock.slot0.returns(0, 0, currentIndex, CARDINALITY, 0, 0, 0);

          const oldestIndex: number = (currentIndex + 1) % CARDINALITY;
          const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
          const oldestAvailableAge: number = timestamp - DEFAULT_TWAP_INTERVAL + 60;
          const latestObservationIsInitialized: boolean = true;
          await pool.mock.observations
            .withArgs(oldestIndex)
            .returns(oldestAvailableAge, 0, 0, latestObservationIsInitialized);
        });

        it("reverts", async function () {
          const deployUniswapV3PriceFeedPromise: Promise<GodModeUniswapV3PriceFeed> = deployUniswapV3PriceFeed(
            deployer,
            pool.address,
            usdc.address,
            DEFAULT_TWAP_INTERVAL,
          );

          await expect(deployUniswapV3PriceFeedPromise).to.be.revertedWith(
            UniswapV3PriceFeedErrors.TWAP_CRITERIA_NOT_SATISFIED,
          );
        });
      });

      context("when the pool does not have enough cardinality", function () {
        beforeEach(async function () {
          const currentIndex: number = 0;
          await pool.mock.slot0.returns(0, 0, currentIndex, CARDINALITY - 1, 0, 0, 0);

          const oldestIndex: number = (currentIndex + 1) % (CARDINALITY - 1);
          const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
          const oldestAvailableAge: number = timestamp - DEFAULT_TWAP_INTERVAL;
          const latestObservationIsInitialized: boolean = true;
          await pool.mock.observations
            .withArgs(oldestIndex)
            .returns(oldestAvailableAge, 0, 0, latestObservationIsInitialized);
        });

        it("reverts", async function () {
          const deployUniswapV3PriceFeedPromise: Promise<GodModeUniswapV3PriceFeed> = deployUniswapV3PriceFeed(
            deployer,
            pool.address,
            usdc.address,
            DEFAULT_TWAP_INTERVAL,
          );

          await expect(deployUniswapV3PriceFeedPromise).to.be.revertedWith(
            UniswapV3PriceFeedErrors.TWAP_CRITERIA_NOT_SATISFIED,
          );
        });
      });
    });
  });
}
