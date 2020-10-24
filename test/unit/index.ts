import { baseContext } from "../contexts";

import { unitTestBalanceSheet } from "./balanceSheet/BalanceSheet";
import { unitTestFintroller } from "./fintroller/Fintroller";
import { unitTestFyToken } from "./fyToken/FyToken";
import { unitTestOraclePriceUtils } from "./oraclePriceUtils/OraclePriceUtils";
import { unitTestRedemptionPool } from "./redemptionPool/RedemptionPool";

baseContext("Unit Tests", function () {
  unitTestBalanceSheet();
  unitTestFintroller();
  unitTestFyToken();
  unitTestOraclePriceUtils();
  unitTestRedemptionPool();
});
