import { RuleInfo } from '@voximplant/apiclient-nodejs/dist/Structures';
import { VoxRule, VoxRuleMetadata } from '../entities/vox-rule.entity';

export type FullVoxRuleInfo = RuleInfo;

export type VoxRuleMetadataScenario = {
  scenarioName: string;
  scenarioId: number;
};

export type VoxRulesList = VoxRule[];

export type VoxRulesMetadataList = VoxRuleMetadata[];
