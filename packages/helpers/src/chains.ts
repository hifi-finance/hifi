import { CHAIN_IDS } from "@hifi/constants";
import type { NetworkUserConfig } from "hardhat/types";

export function getChainConfig(
  chain: keyof typeof CHAIN_IDS,
  infuraApiKey: string,
  mnemonic: string,
): NetworkUserConfig {
  const url: string = "https://" + chain + ".infura.io/v3/" + infuraApiKey;
  return {
    accounts: {
      count: 10,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: CHAIN_IDS[chain],
    url,
  };
}
