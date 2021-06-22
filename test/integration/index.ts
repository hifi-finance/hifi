import { baseContext } from "../shared/contexts";
import { integrationTestHifiPool } from "./hifiPool/HifiPool";

baseContext("Integration Tests", function () {
  integrationTestHifiPool();
});
