import { exit } from 'process';

import { ApplicationConfigService } from '../domains/services/application-config.service';
import { ApplicationConfig } from '../domains/types/application-config.type';
import { VoxApplicationService } from '../domains/services/vox-application.service';
import { VoxRuleService } from '../domains/services/vox-rule.service';
import { VoxScenarioService } from '../domains/services/vox-scenario.service';
import { FileSystemContext } from '../domains/contexts/filesystem.context';
import { VoxScenarioPersistentRepository } from '../domains/repositories/vox-scenario.persistent.repository';
import { VoxRulePersistentRepository } from '../domains/repositories/vox-rule.persistent.repository';
import { VoxApplicationPersistentRepository } from '../domains/repositories/vox-application.persistent.repository';
import { VoxApplicationPlatformRepository } from '../domains/repositories/vox-application.platform.repository';
import { VoximplantContext } from '../domains/contexts/voximplant.context';
import { VoxRulePlatformRepository } from '../domains/repositories/vox-rule.platform.repository';
import { VoxScenarioPlatformRepository } from '../domains/repositories/vox-scenario.platform.repository';
import { FullVoxApplicationInfo } from '../domains/types/vox-application.type';
import { FullVoxScenarioInfo } from '../domains/types/vox-scenario.type';
import {
  ApplicationBuildAndUploadJobSettings,
  ApplicationBuildJobSettings,
  ApplicationByRuleBuildAndUploadJobSettings,
  ApplicationByRuleBuildJobSettings,
} from '../domains/types/job-settings.type';
import {
  FullVoxRuleInfo,
  VoxRulesList,
  VoxRulesMetadataList,
} from '../domains/types/vox-rule.type';
import { VoxRule } from '../domains/entities/vox-rule.entity';
import { LogMessageGeneratorFactory } from '../utils/logMessageGenerator';
import { ScenarioInfo } from '@voximplant/apiclient-nodejs/dist/Structures';

export class ApplicationModule {
  private voxApplicationService: VoxApplicationService;
  private voxRuleService: VoxRuleService;
  private voxScenarioService: VoxScenarioService;
  private lmg = LogMessageGeneratorFactory.getInstance();

  init = async (): Promise<void> => {
    try {
      /**
       * ApplicationConfigService
       */
      const applicationConfigService = new ApplicationConfigService();
      const applicationConfig: ApplicationConfig =
        applicationConfigService.getConfig();

      /**
       * Configs
       */
      const rootDirectoryName = applicationConfig.voxengine_ci.ROOT_DIRECTORY;
      const metadataDirectoryName = '.voxengine-ci';
      const voximplantCredentials = applicationConfig.voximplant.CREDENTIALS;

      /**
       * VoximplantContext
       */
      const voximplantContext = new VoximplantContext(voximplantCredentials);
      await voximplantContext.init();

      /**
       * FileSystemContext
       */
      const filesystemContext = new FileSystemContext(
        rootDirectoryName,
        metadataDirectoryName,
      );
      await filesystemContext.init();

      /**
       * VoxApplicationPlatformRepository
       */
      const voxApplicationPlatformRepository =
        new VoxApplicationPlatformRepository(voximplantContext);
      voxApplicationPlatformRepository.init();

      /**
       * VoxRulePlatformRepository
       */
      const voxRulePlatformRepository = new VoxRulePlatformRepository(
        voximplantContext,
      );
      voxRulePlatformRepository.init();

      /**
       * VoxScenarioPlatformRepository
       */
      const voxScenarioPlatformRepository = new VoxScenarioPlatformRepository(
        voximplantContext,
      );
      voxScenarioPlatformRepository.init();

      /**
       * VoxApplicationPersistentRepository
       */
      const voxApplicationPersistentRepository =
        new VoxApplicationPersistentRepository(filesystemContext);
      await voxApplicationPersistentRepository.init();

      /**
       * VoxRulePersistentRepository
       */
      const voxRulePersistentRepository = new VoxRulePersistentRepository(
        filesystemContext,
      );
      await voxRulePersistentRepository.init();

      /**
       * VoxScenarioPersistentRepository
       */
      const voxScenarioPersistentRepository =
        new VoxScenarioPersistentRepository(filesystemContext);
      await voxScenarioPersistentRepository.init();

      /**
       * VoxApplicationService
       */
      this.voxApplicationService = new VoxApplicationService(
        voxApplicationPlatformRepository,
        voxApplicationPersistentRepository,
      );
      this.voxApplicationService.init();

      /**
       * VoxRuleService
       */
      this.voxRuleService = new VoxRuleService(
        voxRulePlatformRepository,
        voxRulePersistentRepository,
      );
      this.voxRuleService.init();

      /**
       * VoxScenarioService
       */
      this.voxScenarioService = new VoxScenarioService(
        voxScenarioPlatformRepository,
        voxScenarioPersistentRepository,
      );

      this.voxScenarioService.init();
    } catch (error) {
      console.error(this.lmg.generate('INIT_FAILED', this.constructor.name));
      console.error(error);
      exit(1);
    }
  };

  projectCleanup = async (): Promise<void> => {
    try {
      await this.voxApplicationService.cleanup();
      await this.voxScenarioService.cleanup();
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__PROJECT_CLEANUP_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  projectInit = async (): Promise<void> => {
    try {
      const isApplicationAlreadyExists =
        await this.voxApplicationService.checkApplicationsAlreadyExists();
      if (isApplicationAlreadyExists) {
        throw new Error(
          this.lmg.generate('ERR__PROJECT_IS_ALREADY_INITIALIZED'),
        );
      }
      const rawScenarios: FullVoxScenarioInfo[] =
        await this.voxScenarioService.downloadScenarios();

      this.voxScenarioService.checkScenariosNames(rawScenarios);

      for (const rawScenario of rawScenarios) {
        const rawFullScenario: FullVoxScenarioInfo =
          await this.voxScenarioService.downloadScenarioWithScript(rawScenario);
        await this.voxScenarioService.saveScenario(rawFullScenario);
        await this.voxScenarioService.saveScenarioMetadata(rawFullScenario);
      }
      const rawApplications: FullVoxApplicationInfo[] =
        await this.voxApplicationService.downloadApplications();
      if (!rawApplications.length) {
        console.info(this.lmg.generate('INFO__NO_APPLICATIONS'));
        return;
      }
      for (const rawApplication of rawApplications) {
        await this.voxApplicationService.saveApplication(rawApplication);
        await this.voxApplicationService.saveApplicationMetadata(
          rawApplication,
        );
        const rawRules: FullVoxRuleInfo[] =
          await this.voxRuleService.downloadApplicationRules(rawApplication);
        await this.voxRuleService.saveRules(rawApplication, rawRules);
        await this.voxRuleService.saveRulesMetadata(rawApplication, rawRules);
      }
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__PROJECT_INIT_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  private getRulesByApplicationName = async (
    applicationName: string,
  ): Promise<VoxRulesList | []> => {
    return (
      (await this.voxRuleService.readApplicationRulesByName(applicationName)) ||
      []
    );
  };

  private getScenariosByRuleId = async (
    applicationName: string,
    applicationId: number,
    ruleId: number,
  ): Promise<Partial<VoxRule> | undefined> => {
    if (!ruleId) return;

    const rulesMetadataList: VoxRulesMetadataList =
      await this.voxRuleService.readApplicationRulesMetadata(applicationName);
    const ruleMetadataById = rulesMetadataList?.find(
      (ruleMetadata) => ruleMetadata.ruleId === ruleId,
    );
    const ruleList: VoxRulesList =
      await this.voxRuleService.readApplicationRulesByName(applicationName);

    const ruleToUpload = ruleList?.find(
      (rule) => rule.ruleName === ruleMetadataById?.ruleName,
    );
    if (!ruleToUpload) {
      throw new Error(
        this.lmg.generate('ERR__RULE_ID_DOES_NOT_EXIST', ruleId.toString()),
      );
    }
    const { scenarios, rulePattern } = ruleToUpload;
    return {
      scenarios,
      rulePattern,
    };
  };

  private getScenariosByRuleName = async (
    applicationName: string,
    applicationId: number,
    ruleName: string,
  ): Promise<Partial<VoxRule> | undefined> => {
    if (!ruleName) return;

    const voxRulesList: VoxRulesList =
      await this.voxRuleService.readApplicationRulesByName(applicationName);

    await this.voxScenarioService.cleanupDist();
    const ruleByName = voxRulesList?.find((rule) => rule.ruleName === ruleName);
    if (!ruleByName) {
      throw new Error(
        this.lmg.generate('ERR__RULE_NAME_DOES_NOT_EXIST', ruleName),
      );
    }
    const { scenarios, rulePattern } = ruleByName;
    return { scenarios, rulePattern };
  };

  addApplicationToPlatform = async (applicationName: string) => {
    try {
      const applicationId = await this.voxApplicationService.addApplication(
        applicationName,
      );
      const rawApplication: FullVoxApplicationInfo = {
        applicationName,
        applicationId: applicationId,
        modified: new Date(),
        secureRecordStorage: false,
      };
      await this.voxApplicationService.saveApplicationMetadata(rawApplication);
      return applicationId;
    } catch (error) {
      console.error(error);
      throw new Error(
        this.lmg.generate('ERR__CANNOT_ADD_APP', applicationName),
      );
    }
  };

  bindScenarios = async (
    existingRule: FullVoxRuleInfo,
    uploadedScenariosInfo: ScenarioInfo[],
    applicationId: number,
    applicationName: string,
  ) => {
    const uploadedScenariosIds = uploadedScenariosInfo.map(
      ({ scenarioId }) => scenarioId,
    );
    const uploadedScenariosNames = uploadedScenariosInfo.map(
      ({ scenarioName }) => scenarioName,
    );
    const bindScenarioRequest = {
      scenarioId: uploadedScenariosIds,
      scenarioName: uploadedScenariosNames.join(';'),
      ruleId: existingRule.ruleId,
      ruleName: existingRule.ruleName,
      applicationId: applicationId,
      applicationName,
      bind: true,
    };
    const unbindScenarioRequest = {
      scenarioId: existingRule.scenarios
        // TODO: Nodejs mapper error (snake_case to camelCase)
        // @ts-expect-error: Nodejs mapper error (snake_case to camelCase)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        .map(({ scenario_id }) => scenario_id)
        .filter((scenarioId) => !uploadedScenariosIds.includes(scenarioId)),
      scenarioName: existingRule.scenarios
        // TODO: Nodejs mapper error (snake_case to camelCase)
        // @ts-expect-error: Nodejs mapper error (snake_case to camelCase)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        .map(({ scenario_name }) => scenario_name)
        .filter(
          (scenarioName) => !uploadedScenariosNames.includes(scenarioName),
        )
        .join(';'),
      ruleId: existingRule.ruleId,
      ruleName: existingRule.ruleName,
      applicationId: applicationId,
      applicationName,
      bind: false,
    };
    if (unbindScenarioRequest.scenarioId?.length) {
      await this.voxScenarioService.addScenariosToRule(unbindScenarioRequest);
    }
    if (uploadedScenariosInfo.length) {
      await this.voxScenarioService.addScenariosToRule(bindScenarioRequest);
    }
  };

  applicationBuild = async (
    settings: ApplicationBuildJobSettings,
  ): Promise<void> => {
    const { applicationName } =
      await this.voxApplicationService.getApplicationNameAndId(settings);
    try {
      const voxRulesList: VoxRulesList = await this.getRulesByApplicationName(
        applicationName,
      );
      await this.voxScenarioService.cleanupDist();
      for (const voxRule of voxRulesList) {
        const { scenarios } = voxRule;
        await this.voxScenarioService.build(scenarios);
      }
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__APPLICATION_BUILD_FAILED',
          this.constructor.name,
        ),
      );
      throw error;
    }
  };

  applicationBuildAndUpload = async (
    settings: ApplicationBuildAndUploadJobSettings,
  ) => {
    try {
      const { applicationName, applicationId } =
        await this.voxApplicationService.getApplicationNameAndId(settings);

      const newApplicationId =
        !applicationId &&
        (await this.addApplicationToPlatform(applicationName));

      const voxRulesList: VoxRulesList = await this.getRulesByApplicationName(
        applicationName,
      );
      const rawApplication: FullVoxApplicationInfo = {
        applicationName,
        applicationId: applicationId || newApplicationId,
        modified: new Date(),
        secureRecordStorage: false,
      };
      const rulesFromPlatform =
        await this.voxRuleService.downloadApplicationRules(rawApplication);
      await this.voxScenarioService.cleanupDist();
      for (const voxRule of voxRulesList) {
        const { scenarios, rulePattern, ruleName } = voxRule;
        await this.voxScenarioService.build(scenarios);
        const { isForce } = settings;
        await this.voxScenarioService.upload(scenarios, isForce);
        const uploadedScenariosInfo =
          await this.voxScenarioService.getScenarioInfoFromPlatform(scenarios);
        const existingRule = rulesFromPlatform?.find(
          (rule) => rule.ruleName === ruleName,
        );
        if (!existingRule) {
          await this.voxRuleService.uploadApplicationRule(
            applicationId || newApplicationId,
            ruleName,
            uploadedScenariosInfo.map(({ scenarioId }) => scenarioId),
            rulePattern,
          );
        }
        const rulePatternChanged = existingRule?.rulePattern !== rulePattern;
        if (existingRule && rulePatternChanged) {
          await this.voxRuleService.updateApplicationRule(
            rulePattern,
            existingRule.ruleId,
          );
        }
        const scenariosChanged =
          existingRule?.scenarios
            // TODO: Nodejs mapper error (snake_case to camelCase)
            // @ts-expect-error: Nodejs mapper error (snake_case to camelCase)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            .map((scenario) => scenario.scenario_name)
            .toString() !== scenarios.toString();
        if (existingRule && scenariosChanged) {
          await this.bindScenarios(
            existingRule,
            uploadedScenariosInfo,
            applicationId || newApplicationId,
            applicationName,
          );
        }
      }
      const rawRulesWithOldOrder: FullVoxRuleInfo[] =
        await this.voxRuleService.downloadApplicationRules(rawApplication);
      await this.voxRuleService.saveRulesMetadata(
        rawApplication,
        rawRulesWithOldOrder,
      );

      await this.voxRuleService.reorderRules(
        rawRulesWithOldOrder,
        voxRulesList,
      );

      const rawRules: FullVoxRuleInfo[] =
        await this.voxRuleService.downloadApplicationRules(rawApplication);
      await this.voxRuleService.saveRulesMetadata(rawApplication, rawRules);
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__APPLICATION_BUILD_AND_UPLOAD_FAILED',
          this.constructor.name,
        ),
      );
      throw error;
    }
  };

  applicationByRuleBuild = async (
    settings: ApplicationByRuleBuildJobSettings,
  ): Promise<void> => {
    try {
      const { applicationName, applicationId } = settings;
      const fullApplicationName =
        await this.voxApplicationService.getApplicationFullName(
          applicationName,
        );
      const { scenarios } =
        (await this.getScenariosByRuleId(
          fullApplicationName,
          applicationId,
          settings.ruleId,
        )) ||
        (await this.getScenariosByRuleName(
          fullApplicationName,
          applicationId,
          settings.ruleName,
        ));
      await this.voxScenarioService.build(scenarios);
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__APPLICATION_BY_RULE_BUILD_FAILED',
          this.constructor.name,
        ),
      );
      throw error;
    }
  };

  applicationByRuleBuildAndUpload = async (
    settings: ApplicationByRuleBuildAndUploadJobSettings,
  ): Promise<void> => {
    try {
      const { applicationName, applicationId } =
        await this.voxApplicationService.getApplicationNameAndId(settings);
      const { isForce, ruleName, ruleId } = settings;
      let newApplicationId: number;
      if (!applicationId && !ruleId && !ruleName) {
        newApplicationId = await this.addApplicationToPlatform(applicationName);
      }
      const { scenarios, rulePattern } =
        (await this.getScenariosByRuleId(
          applicationName,
          applicationId || newApplicationId,
          ruleId,
        )) ||
        (await this.getScenariosByRuleName(
          applicationName,
          applicationId || newApplicationId,
          ruleName,
        ));
      await this.voxScenarioService.build(scenarios);
      await this.voxScenarioService.upload(scenarios, isForce);
      const uploadedScenariosInfo =
        await this.voxScenarioService.getScenarioInfoFromPlatform(scenarios);
      const rawApplication: FullVoxApplicationInfo = {
        applicationName,
        applicationId: applicationId || newApplicationId,
        modified: new Date(),
        secureRecordStorage: false,
      };
      const existingRule = (
        await this.voxRuleService.downloadApplicationRules(rawApplication)
      )?.find(
        (rule) =>
          rule.ruleName === settings.ruleName ||
          rule.ruleId === settings.ruleId,
      );
      if (settings.ruleId && !existingRule) {
        throw new Error(
          this.lmg.generate(
            'ERR__RULE_ID_DOES_NOT_EXIST',
            settings.ruleId.toString(),
          ),
        );
      }
      if (!existingRule) {
        await this.voxRuleService.uploadApplicationRule(
          applicationId || newApplicationId,
          settings.ruleName,
          uploadedScenariosInfo.map(({ scenarioId }) => scenarioId),
          rulePattern,
        );
      }
      const rulePatternChanged = existingRule?.rulePattern !== rulePattern;
      if (existingRule && rulePatternChanged) {
        await this.voxRuleService.updateApplicationRule(
          rulePattern,
          existingRule.ruleId,
        );
      }
      const scenariosChanged =
        existingRule?.scenarios
          // TODO: Nodejs mapper error (snake_case to camelCase)
          // @ts-expect-error: Nodejs mapper error (snake_case to camelCase)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          .map((scenario) => scenario.scenario_name)
          .toString() !== scenarios.toString();
      if (existingRule && scenariosChanged) {
        await this.bindScenarios(
          existingRule,
          uploadedScenariosInfo,
          applicationId || newApplicationId,
          applicationName,
        );
      }
      const rawRules: FullVoxRuleInfo[] =
        await this.voxRuleService.downloadApplicationRules(rawApplication);
      await this.voxRuleService.saveRulesMetadata(rawApplication, rawRules);
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__APPLICATION_BY_RULE_BUILD_AND_UPLOAD_FAILED',
          this.constructor.name,
        ),
      );
      throw error;
    }
  };
}
