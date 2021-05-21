import { baseContext } from "../contexts";
import { unitTestHifiPool } from "./hifiPool/HifiPool";
import { unitTestYieldSpace } from "./yieldSpace/YieldSpace";

baseContext("Unit Tests", function () {
  unitTestHifiPool();
  unitTestYieldSpace();
});
