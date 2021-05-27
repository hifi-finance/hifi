import { baseContext } from "../contexts";
import { unitTestBalanceSheet } from "./balanceSheet/BalanceSheet";
import { unitTestChainlinkOperator } from "./chainlinkOperator/ChainlinkOperator";
import { unitTestFintroller } from "./fintroller/Fintroller";
import { unitTestHToken } from "./hToken/HToken";
import { unitTestRedemptionPool } from "./redemptionPool/RedemptionPool";

baseContext("Unit Tests", function () {
  unitTestBalanceSheet();
  unitTestChainlinkOperator();
  unitTestFintroller();
  unitTestHToken();
  unitTestRedemptionPool();
});
