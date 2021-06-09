import { baseContext } from "../shared/contexts";
import { integrationTestBalanceSheet } from "./balanceSheet/BalanceSheet";
import { integrationTestHToken } from "./hToken/HToken";

baseContext("Integration Tests", function () {
  integrationTestBalanceSheet();
  integrationTestHToken();
});
