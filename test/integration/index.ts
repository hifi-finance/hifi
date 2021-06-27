import { baseContext } from "../shared/contexts";
import { integrationTestBalanceSheet } from "./balanceSheet/BalanceSheet";

baseContext("Integration Tests", function () {
  integrationTestBalanceSheet();
});
