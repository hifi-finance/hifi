import { BuidlerNetworkAccount } from "@nomiclabs/buidler/types";

import { defaultPrivateKeys } from "./constants";

/**
 * Six accounts with 10,000 ETH each. We need to use these instead of the default
 * Buidler accounts because some tests depend on hardcoded private keys.
 *
 * 0x5a2E001C52Ba44e501c35B769822859cF83A23D7
 * 0xf3B2b6f3fB19e5D6541ecF86bBFfe0126880Bb0c
 * 0x7523b47C56f673EA1CaFd4672cA9245Ad1bcE03D
 * 0x59204B9dA861F9C1EC3D728af305D5EEf4Db64E8
 * 0x9e705a94E91736B48f594C603d3Fe0805B0Ca4A0
 * 0xeB7Ba84d23C8484A5dec9E136e4ccFEaf35378DB
 */
const tenThousandEther: string = "10000000000000000000000";
const accounts: BuidlerNetworkAccount[] = [
  {
    balance: tenThousandEther,
    privateKey: defaultPrivateKeys.admin,
  },
  {
    balance: tenThousandEther,
    privateKey: defaultPrivateKeys.borrower,
  },
  {
    balance: tenThousandEther,
    privateKey: defaultPrivateKeys.lender,
  },
  {
    balance: tenThousandEther,
    privateKey: defaultPrivateKeys.liquidator,
  },
  {
    balance: tenThousandEther,
    privateKey: defaultPrivateKeys.maker,
  },
  {
    balance: tenThousandEther,
    privateKey: defaultPrivateKeys.raider,
  },
];

export default accounts;
