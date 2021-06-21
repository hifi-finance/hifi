import { baseContext } from "../shared/contexts";
import { integrationTestHifiFlashSwap } from "./hifiFlashSwap/HifiFlashSwap";

baseContext("Integration Tests", function () {
  integrationTestHifiFlashSwap();
});
