import { baseContext } from "../shared/contexts";
import { unitTestHifiPool } from "./hifiPool/HifiPool";
import { unitTestHifiPoolRegistry } from "./hifiPoolRegistry/HifiPoolRegistry";
import { unitTestYieldSpace } from "./yieldSpace/YieldSpace";

baseContext("Unit Tests", function () {
  unitTestHifiPool();
  unitTestHifiPoolRegistry();
  unitTestYieldSpace();
});
