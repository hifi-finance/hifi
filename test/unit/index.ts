import { baseContext } from "../shared/contexts";
import { unitTestHifiPool } from "./hifiPool/HifiPool";
import { unitTestYieldSpace } from "./yieldSpace/YieldSpace";

baseContext("Unit Tests", function () {
  unitTestHifiPool();
  unitTestYieldSpace();
});
