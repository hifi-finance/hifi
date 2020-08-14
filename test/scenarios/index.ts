import { Scenario } from "../../@types";

import defaultScenario from "./default";

const scenarioKeys = ["default"];
export type ScenarioKey = typeof scenarioKeys[number];

const scenarios: Record<ScenarioKey, Scenario> = {
  default: defaultScenario,
};

export default scenarios;
