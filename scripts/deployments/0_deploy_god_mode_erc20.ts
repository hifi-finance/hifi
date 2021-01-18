import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

async function main(): Promise<void> {
  const godModeErc20Factory: ContractFactory = await ethers.getContractFactory("GodModeErc20");
  const godModeErc20: Contract = await godModeErc20Factory.deploy("USD Coin", "USDC", 6);
  await godModeErc20.deployed();

  console.log("GodModeErc20 deployed to: ", godModeErc20.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
