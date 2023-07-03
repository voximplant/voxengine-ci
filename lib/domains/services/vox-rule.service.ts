import { VoxRule, VoxRuleMetadata } from '../entities/vox-rule.entity';
import { VoxRulePlatformRepository } from '../repositories/vox-rule.platform.repository';
import { VoxRulePersistentRepository } from '../repositories/vox-rule.persistent.repository';
import { FullVoxApplicationInfo } from '../types/vox-application.type';
import {
  FullVoxRuleInfo,
  VoxRulesList,
  VoxRulesMetadataList,
} from '../types/vox-rule.type';
import { LogMessageGeneratorFactory } from '../../utils/logMessageGenerator';
import { RuleInfo } from '@voximplant/apiclient-nodejs/dist/Structures';

export class VoxRuleService {
  private lmg = LogMessageGeneratorFactory.getInstance();

  constructor(
    private platformRepository: VoxRulePlatformRepository,
    private persistentRepository: VoxRulePersistentRepository,
  ) {}

  init = () => {
    console.info(
      this.lmg.generate('INFO__INIT_SUCCESS', this.constructor.name),
    );
  };

  checkRulesAlreadyExists = async (): Promise<boolean> => {
    const rules = await this.persistentRepository.readStorage();
    const rulesMetadata = await this.persistentRepository.readMetadataStorage();
    return !!rules.length && !!rulesMetadata.length;
  };

  downloadApplicationRules = async (
    rawApplication: FullVoxApplicationInfo,
  ): Promise<FullVoxRuleInfo[]> => {
    const { applicationId, applicationName } = rawApplication;
    return await this.platformRepository.downloadApplicationRules(
      applicationId,
      applicationName,
    );
  };

  uploadApplicationRule = async (
    applicationId: number,
    ruleName: string,
    scenarioId: number[],
    rulePattern: string,
  ) =>
    this.platformRepository.addRule(
      applicationId,
      ruleName,
      scenarioId,
      rulePattern,
    );

  updateApplicationRule = async (rulePattern: string, ruleId: number) => {
    await this.platformRepository.setRuleInfo(rulePattern, ruleId);
  };

  saveRules = async (
    rawApplication: FullVoxApplicationInfo,
    rawRules: FullVoxRuleInfo[],
  ) => {
    try {
      const { applicationName } = rawApplication;
      await this.persistentRepository.createStorage(applicationName);

      const voxRulesList: VoxRulesList = rawRules.map(
        (rawRule) => new VoxRule(rawRule),
      );
      await this.persistentRepository.create(voxRulesList, applicationName);
    } catch (error) {
      console.error(error);
    }
  };

  saveRulesMetadata = async (
    rawApplication: FullVoxApplicationInfo,
    rawRules: FullVoxRuleInfo[],
  ) => {
    try {
      const { applicationName } = rawApplication;
      await this.persistentRepository.createMetadataStorage(applicationName);

      const voxRulesMetadataList: VoxRulesMetadataList = rawRules.map(
        (rawRule) => new VoxRuleMetadata(rawRule),
      );
      await this.persistentRepository.createOrUpdateMetadata(
        voxRulesMetadataList,
        applicationName,
      );
    } catch (error) {
      console.error(error);
    }
  };

  readApplicationRulesByName = async (
    applicationName: string,
  ): Promise<VoxRulesList> => {
    try {
      const voxRuleList =
        (await this.persistentRepository.read(applicationName)) || [];
      for (const voxRule of voxRuleList) {
        if (typeof voxRule.rulePattern !== 'string') {
          voxRule.rulePattern = '.*';
        }
      }
      return voxRuleList;
    } catch (error) {
      console.error(error);
    }
  };

  readApplicationRulesMetadata = async (
    applicationName: string,
  ): Promise<VoxRulesMetadataList> => {
    return (
      (await this.persistentRepository.readMetadata(applicationName)) || []
    );
  };

  reorderRules = async (
    rulesFromPlatform: RuleInfo[],
    voxRulesList: VoxRulesList,
  ): Promise<void> => {
    if (!rulesFromPlatform.length) return;
    const voxRuleListWithId = voxRulesList
      .map((rule) =>
        rulesFromPlatform.find(
          (platformRule) => platformRule.ruleName === rule.ruleName,
        ),
      )
      .filter((rule) => rule);
    const newRulesIdOrder = voxRuleListWithId.map(({ ruleId }) => ruleId);
    const existingRulesOrder = rulesFromPlatform.map(({ ruleId }) => ruleId);
    if (newRulesIdOrder.toString() !== existingRulesOrder.toString()) {
      await this.platformRepository.reorderRules(newRulesIdOrder);
    }
  };
}
