import { RuleInfo } from '@voximplant/apiclient-nodejs/dist/Structures';

import { VoxRuleMetadataScenario } from '../types/vox-rule.type';

export class VoxRule {
  ruleName: string;
  scenarios: string[];
  rulePattern: string;

  constructor(ruleInfo: RuleInfo) {
    this.ruleName = ruleInfo.ruleName;
    // TODO: Nodejs mapper error (snake_case to camelCase)
    // @ts-expect-error: Nodejs mapper error (snake_case to camelCase)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.scenarios = ruleInfo.scenarios.map(({ scenario_name }) => {
      if (scenario_name) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return scenario_name;
      }
    });
    this.rulePattern = ruleInfo.rulePattern;
  }
}

export class VoxRuleMetadata {
  ruleId: number;
  ruleName: string;
  scenarios: VoxRuleMetadataScenario[];
  rulePattern: string;

  constructor(ruleInfo: RuleInfo) {
    this.ruleName = ruleInfo.ruleName;
    this.ruleId = ruleInfo.ruleId;
    this.scenarios = ruleInfo.scenarios.map(
      // TODO: Nodejs mapper error (snake_case to camelCase)
      // @ts-expect-error: Nodejs mapper error (snake_case to camelCase)
      ({ scenario_name, scenario_id }) => {
        if (scenario_name && scenario_id) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          return { scenarioName: scenario_name, scenarioId: scenario_id };
        }
      },
    );
    if (this.scenarios[0] === undefined) {
      this.scenarios = ruleInfo.scenarios.map(
        ({ scenarioName, scenarioId }) => {
          if (scenarioName && scenarioId) {
            return { scenarioName, scenarioId };
          }
        },
      );
    }
    this.rulePattern = ruleInfo.rulePattern;
  }
}
