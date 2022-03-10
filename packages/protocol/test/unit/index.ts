import { baseContext } from "../shared/contexts";
import { unitTestBalanceSheet } from "./balance-sheet/BalanceSheet";
import { unitTestChainlinkOperator } from "./chainlink-operator/ChainlinkOperator";
import { unitTestFintroller } from "./fintroller/Fintroller";
import { unitTestHToken } from "./h-token/HToken";
import { unitTestOwnableUpgradeable } from "./ownable-upgradeable/OwnableUpgradeable";

baseContext("Unit Tests", function () {
  unitTestBalanceSheet();
  unitTestChainlinkOperator();
  unitTestFintroller();
  unitTestHToken();
  unitTestOwnableUpgradeable();
});
