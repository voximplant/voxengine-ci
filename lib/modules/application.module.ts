import { exit } from 'node:process';

import { ScenarioInfo } from '@voximplant/apiclient-nodejs/dist/Structures';

import {
  FullVoxRuleInfo,
  VoxRulesList,
  VoxRulesMetadataList,
} from '../domains/types/vox-rule.type';
import {
  ApplicationBuildAndUploadJobSettings,
  ApplicationBuildJobSettings,
  ApplicationByRuleBuildAndUploadJobSettings,
  ApplicationByRuleBuildJobSettings,
} from '../domains/types/job-settings.type';
import { VoxRule } from '../domains/entities/vox-rule.entity';
import { VoxRuleService } from '../domains/services/vox-rule.service';
import { FullVoxScenarioInfo } from '../domains/types/vox-scenario.type';
import { VoximplantContext } from '../domains/contexts/voximplant.context';
import { LogMessageGeneratorFactory } from '../utils/log-message-generator';
import { FileSystemContext } from '../domains/contexts/file-system.context';
import { ApplicationConfig } from '../domains/types/application-config.type';
import { VoxScenarioService } from '../domains/services/vox-scenario.service';
import {
  FullVoxApplicationInfo,
  VoxApplicationMetadataScenario,
} from '../domains/types/vox-application.type';
import { VoxApplicationService } from '../domains/services/vox-application.service';
import { ApplicationConfigService } from '../domains/services/application-config.service';
import { VoxRulePlatformRepository } from '../domains/repositories/vox-rule.platform.repository';
import { VoxRulePersistentRepository } from '../domains/repositories/vox-rule.persistent.repository';
import { VoxScenarioPlatformRepository } from '../domains/repositories/vox-scenario.platform.repository';
import { VoxScenarioPersistentRepository } from '../domains/repositories/vox-scenario.persistent.repository';
import { VoxApplicationPlatformRepository } from '../domains/repositories/vox-application.platform.repository';
import { VoxApplicationPersistentRepository } from '../domains/repositories/vox-application.persistent.repository';

export class ApplicationModule {
  private voxApplicationService: VoxApplicationService;
  private voxRuleService: VoxRuleService;
  private voxScenarioServices: Map<string, VoxScenarioService> = new Map();
  private lmg: LogMessageGeneratorFactory =
    LogMessageGeneratorFactory.getInstance();
  private fileSystemContext: FileSystemContext;
  private voxScenarioPlatformRepository: VoxScenarioPlatformRepository;

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
      const voximplantHost = applicationConfig.voximplant.HOST;

      /**
       * VoximplantContext
       */
      const voximplantContext = new VoximplantContext(
        voximplantCredentials,
        voximplantHost,
      );
      await voximplantContext.init();

      /**
       * FileSystemContext
       */
      this.fileSystemContext = new FileSystemContext(
        rootDirectoryName,
        metadataDirectoryName,
      );
      await this.fileSystemContext.init();

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
      this.voxScenarioPlatformRepository = new VoxScenarioPlatformRepository(
        voximplantContext,
      );
      this.voxScenarioPlatformRepository.init();

      /**
       * VoxApplicationPersistentRepository
       */
      const voxApplicationPersistentRepository =
        new VoxApplicationPersistentRepository(this.fileSystemContext);
      await voxApplicationPersistentRepository.init();

      /**
       * VoxRulePersistentRepository
       */
      const voxRulePersistentRepository = new VoxRulePersistentRepository(
        this.fileSystemContext,
      );
      await voxRulePersistentRepository.init();

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

      const rawApplications: FullVoxApplicationInfo[] =
        await this.voxApplicationService.downloadApplications();
      if (!rawApplications.length) {
        console.info(this.lmg.generate('INFO__NO_APPLICATIONS'));
        return;
      }
      for (const rawApplication of rawApplications) {
        /**
         * VoxScenarioPersistentRepository
         */
        const voxScenarioPersistentRepository =
          new VoxScenarioPersistentRepository(
            this.fileSystemContext,
            rawApplication.applicationName,
          );
        await voxScenarioPersistentRepository.init();

        /**
         * VoxScenarioService
         */
        const scenarioService = new VoxScenarioService(
          this.voxScenarioPlatformRepository,
          voxScenarioPersistentRepository,
        );
        scenarioService.init();
        this.voxScenarioServices.set(
          rawApplication.applicationName,
          scenarioService,
        );
      }
    } catch (error) {
      console.error(this.lmg.generate('INIT_FAILED', this.constructor.name));
      console.error(error);
      exit(1);
    }
  };

  projectCleanup = async (): Promise<void> => {
    try {
      await this.voxApplicationService.cleanup();
      for (const svc of this.voxScenarioServices.values()) {
        await svc.cleanup();
      }
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__PROJECT_CLEANUP_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  projectInit = async (): Promise<void> => {
    try {
      // const isApplicationAlreadyExists =
      //   await this.voxApplicationService.checkApplicationsAlreadyExists();
      let isScenariosAlreadyExists = false;
      for (const svc of this.voxScenarioServices.values()) {
        if (await svc.checkScenariosAlreadyExists()) {
          isScenariosAlreadyExists = true;
          break;
        }
      }
      if (isScenariosAlreadyExists) {
        throw new Error(
          this.lmg.generate('ERR__PROJECT_IS_ALREADY_INITIALIZED'),
        );
      }
      const rawApplications: FullVoxApplicationInfo[] =
        await this.voxApplicationService.downloadApplications();
      if (!rawApplications.length) {
        console.info(this.lmg.generate('INFO__NO_APPLICATIONS'));
        return;
      }
      for (const rawApplication of rawApplications) {
        await this.voxApplicationService.saveApplication(rawApplication);

        const voxScenarioService = await this.getOrCreateScenarioService(
          rawApplication.applicationName,
        );
        const rawScenarios: FullVoxScenarioInfo[] =
          await voxScenarioService.downloadScenariosByApplicationId(
            rawApplication.applicationId,
          );
        voxScenarioService.checkScenariosNames(rawScenarios);

        const scenarioData: VoxApplicationMetadataScenario[] = [];
        for (const { scenarioId } of rawScenarios) {
          const rawFullScenario: FullVoxScenarioInfo =
            await voxScenarioService.downloadScenario(scenarioId);
          await voxScenarioService.saveScenario(rawFullScenario);
          await voxScenarioService.saveScenarioMetadata(
            rawFullScenario,
            rawApplication.applicationId,
          );
          scenarioData.push({
            scenarioId: rawFullScenario.scenarioId,
            scenarioName: rawFullScenario.scenarioName,
          });
          // sleep for not to send mass amount of requests
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        await this.voxApplicationService.saveApplicationMetadata(
          rawApplication,
          scenarioData,
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
      (await this.voxRuleService.readApplicationRulesByName(applicationName)) ??
      []
    );
  };

  private getOrCreateScenarioService = async (
    applicationName: string,
  ): Promise<VoxScenarioService> => {
    const existing = this.voxScenarioServices.get(applicationName);
    if (existing) {
      return existing;
    }
    const voxScenarioPersistentRepository = new VoxScenarioPersistentRepository(
      this.fileSystemContext,
      applicationName,
    );
    await voxScenarioPersistentRepository.init();
    const scenarioService = new VoxScenarioService(
      this.voxScenarioPlatformRepository,
      voxScenarioPersistentRepository,
    );
    scenarioService.init();
    this.voxScenarioServices.set(applicationName, scenarioService);
    return scenarioService;
  };

  private ensureLocalOrPlatformApplication = async (
    applicationName: string,
    applicationId?: number,
  ): Promise<void> => {
    if (applicationId) {
      return;
    }
    const localApplication = await this.voxApplicationService.readApplication(
      applicationName,
    );
    if (!localApplication) {
      throw new Error(
        this.lmg.generate('ERR__APP_BY_NAME_DOES_NOT_EXIST', applicationName),
      );
    }
  };

  private toMetadataScenarios = (
    scenarios: Array<{ scenarioId: number; scenarioName: string }>,
  ): VoxApplicationMetadataScenario[] =>
    scenarios
      .filter((scenario) => scenario?.scenarioId && scenario?.scenarioName)
      .map(({ scenarioId, scenarioName }) => ({ scenarioId, scenarioName }));

  private getScenariosByRuleId = async (
    applicationName: string,
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
    ruleName: string,
  ): Promise<Partial<VoxRule> | undefined> => {
    if (!ruleName) return;

    const voxRulesList: VoxRulesList =
      await this.voxRuleService.readApplicationRulesByName(applicationName);

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

      const voxScenarioService = await this.getOrCreateScenarioService(
        applicationName,
      );
      const scenarios =
        await voxScenarioService.downloadScenariosByApplicationId(
          applicationId,
        );

      await this.voxApplicationService.saveApplicationMetadata(
        rawApplication,
        this.toMetadataScenarios(scenarios),
      );
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
      const voxScenarioService = await this.getOrCreateScenarioService(
        applicationName,
      );
      await voxScenarioService.addScenariosToRule(unbindScenarioRequest);
    }
    if (uploadedScenariosInfo.length) {
      const voxScenarioService = await this.getOrCreateScenarioService(
        applicationName,
      );
      await voxScenarioService.addScenariosToRule(bindScenarioRequest);
    }
  };

  applicationBuild = async (
    settings: ApplicationBuildJobSettings,
  ): Promise<void> => {
    const { applicationName, applicationId } =
      await this.voxApplicationService.getApplicationNameAndId(settings);
    try {
      await this.ensureLocalOrPlatformApplication(
        applicationName,
        applicationId,
      );
      const voxRulesList: VoxRulesList = await this.getRulesByApplicationName(
        applicationName,
      );
      const voxScenarioService = await this.getOrCreateScenarioService(
        applicationName,
      );
      await voxScenarioService.cleanupDist();
      for (const voxRule of voxRulesList) {
        const { scenarios } = voxRule;
        await voxScenarioService.build(scenarios);
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
      const getApplicationNameAndIdResult =
        await this.voxApplicationService.getApplicationNameAndId(settings);
      const { applicationName } = getApplicationNameAndIdResult;
      const applicationId =
        getApplicationNameAndIdResult.applicationId ??
        (await this.addApplicationToPlatform(applicationName));
      const voxRulesList: VoxRulesList = await this.getRulesByApplicationName(
        applicationName,
      );
      const rawApplication: FullVoxApplicationInfo = {
        applicationName,
        applicationId,
        modified: new Date(),
        secureRecordStorage: false,
      };

      const voxScenarioService = await this.getOrCreateScenarioService(
        applicationName,
      );

      const rulesFromPlatform =
        await this.voxRuleService.downloadApplicationRules(rawApplication);
      await voxScenarioService.cleanupDist();
      for (const voxRule of voxRulesList) {
        const { scenarios, rulePattern, ruleName } = voxRule;
        await voxScenarioService.build(scenarios);
        const { isForce } = settings;
        await voxScenarioService.upload(scenarios, isForce, applicationId);
        const uploadedScenariosInfo =
          await voxScenarioService.getScenarioInfoFromPlatform(
            scenarios,
            applicationId,
          );
        const existingRule = rulesFromPlatform?.find(
          (rule) => rule.ruleName === ruleName,
        );
        if (!existingRule) {
          await this.voxRuleService.uploadApplicationRule(
            applicationId,
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
            applicationId,
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

      const platformScenarios =
        await voxScenarioService.downloadScenariosByApplicationId(
          applicationId,
        );
      await this.voxApplicationService.saveApplicationMetadata(
        rawApplication,
        this.toMetadataScenarios(platformScenarios),
      );
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
      const { applicationName, applicationId } =
        await this.voxApplicationService.getApplicationNameAndId(settings);
      await this.ensureLocalOrPlatformApplication(
        applicationName,
        applicationId,
      );
      const { scenarios } =
        (await this.getScenariosByRuleId(applicationName, settings.ruleId)) ??
        (await this.getScenariosByRuleName(applicationName, settings.ruleName));

      const voxScenarioService = await this.getOrCreateScenarioService(
        applicationName,
      );
      await voxScenarioService.cleanupDist();
      await voxScenarioService.build(scenarios);
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
      const resolvedApplicationId = applicationId || newApplicationId;
      const { scenarios, rulePattern } =
        (await this.getScenariosByRuleId(applicationName, ruleId)) ||
        (await this.getScenariosByRuleName(applicationName, ruleName));

      const voxScenarioService = await this.getOrCreateScenarioService(
        applicationName,
      );
      await voxScenarioService.cleanupDist();
      await voxScenarioService.build(scenarios);
      await voxScenarioService.upload(
        scenarios,
        isForce,
        resolvedApplicationId,
      );
      const uploadedScenariosInfo =
        await voxScenarioService.getScenarioInfoFromPlatform(
          scenarios,
          resolvedApplicationId,
        );
      const rawApplication: FullVoxApplicationInfo = {
        applicationName,
        applicationId: resolvedApplicationId,
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
          resolvedApplicationId,
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
          resolvedApplicationId,
          applicationName,
        );
      }
      const rawRules: FullVoxRuleInfo[] =
        await this.voxRuleService.downloadApplicationRules(rawApplication);
      await this.voxRuleService.saveRulesMetadata(rawApplication, rawRules);

      const platformScenarios =
        await voxScenarioService.downloadScenariosByApplicationId(
          resolvedApplicationId,
        );
      await this.voxApplicationService.saveApplicationMetadata(
        rawApplication,
        this.toMetadataScenarios(platformScenarios),
      );
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
