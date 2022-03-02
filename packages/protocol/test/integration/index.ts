import { baseContext } from "../shared/contexts";
import { integrationTestBalanceSheet } from "./balance-sheet/BalanceSheet";

baseContext("Integration Tests", function () {
  integrationTestBalanceSheet();
});
