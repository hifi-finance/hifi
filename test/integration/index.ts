import { baseContext } from "../contexts";

import { integrationTestHifiFlashSwap } from "./hifiFlashSwap/HifiFlashSwap";

baseContext("Integration Tests", function () {
  integrationTestHifiFlashSwap();
});
