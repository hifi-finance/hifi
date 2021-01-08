import { baseContext } from "../contexts";

import { e2eTestHifiFlashSwap } from "./hifiFlashSwap/HifiFlashSwap";

baseContext("E2E Tests", function () {
  e2eTestHifiFlashSwap();
});
