import { baseContext } from "../contexts";

import { e2eTestBalanceSheet } from "./balanceSheet/BalanceSheet";

/* These tests fail because of https://github.com/trufflesuite/ganache-core/issues/654. */
baseContext("E2E Tests", function () {
  e2eTestBalanceSheet();
});
