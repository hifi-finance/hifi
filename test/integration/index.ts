import { baseContext } from "../contexts";
import { integrationTestFyToken } from "./fyToken/FyToken";
import { integrationTestRedemptionPool } from "./redemptionPool/RedemptionPool";

baseContext("Integration Tests", function () {
  integrationTestFyToken();
  integrationTestRedemptionPool();
});
