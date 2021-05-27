import { baseContext } from "../contexts";
import { integrationTestHToken } from "./hToken/HToken";
import { integrationTestRedemptionPool } from "./redemptionPool/RedemptionPool";

baseContext("Integration Tests", function () {
  integrationTestHToken();
  integrationTestRedemptionPool();
});
