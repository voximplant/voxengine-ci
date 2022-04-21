import { expect, use } from 'chai';
import chaiAsPromised = require('chai-as-promised');
import { describe, it, before, beforeEach, after } from 'mocha';
import { ApplicationModule } from '../../../../lib/modules/application.module';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'fs';
import path from 'path';
import { mkdir, writeFile, rmdir } from 'fs/promises';
import VoximplantApiClient from '@voximplant/apiclient-nodejs';
import { createHash } from 'crypto';

describe('init -- force', () => {
  beforeEach(async () => {
    const application = new ApplicationModule();
    await application.init();
    await application.projectCleanup();
    await application.projectInit();
  });
  it('create application directory', async () => {
    const applicationDirectoryPath = path.resolve('voxfiles/applications');
    const existApplicationDirectory = existsSync(applicationDirectoryPath);
    expect(existApplicationDirectory).to.equal(true);
  });
  it('create application metadata directory', async () => {
    const pathTo = path.resolve('voxfiles/.voxengine-ci/applications');
    const existApplicationMetadataDirectory = existsSync(pathTo);
    expect(existApplicationMetadataDirectory).to.equal(true);
  });
});

describe('npx voxengine-ci upload --application-name test\nupload NEW app "test" with rule "first-rule", scenario "first-test-scenario"', async () => {
  let client: VoximplantApiClient;
  let applicationId: number;
  before(async () => {
    client = new VoximplantApiClient('vox_ci_credentials.json');
    await new Promise((resolve) => {
      client.onReady = () => {
        resolve(1);
      };
    });
    const application = new ApplicationModule();
    await application.init();
    await application.projectCleanup();
    await application.projectInit();
    const appConfigDirPath = path.resolve(
      'voxfiles/applications/test.nikit.voximplant.com',
    );
    if (!existsSync(appConfigDirPath)) await mkdir(appConfigDirPath);
    const appConfig = '{"applicationName":"test.nikit.voximplant.com"}';
    writeFileSync(
      path.join(appConfigDirPath, 'application.config.json'),
      appConfig,
    );
    const rulesConfig =
      '[{"ruleName":"first-rule","scenarios":["second-test-scenario","first-test-scenario"],"rulePattern":"RULE_ONE_.*"}]';
    writeFileSync(
      path.join(appConfigDirPath, 'rules.config.json'),
      rulesConfig,
    );
    // create scenarios
    const scenariosSrcPath = 'voxfiles/scenarios/src';
    const firstTestScenario = 'const first = 1;';
    const secondTestScenario = 'const second = 2;';
    writeFileSync(
      path.join(scenariosSrcPath, 'first-test-scenario.voxengine.js'),
      firstTestScenario,
    );
    writeFileSync(
      path.join(scenariosSrcPath, 'second-test-scenario.voxengine.js'),
      secondTestScenario,
    );
    await application.applicationBuildAndUpload({
      applicationName: 'test',
      applicationId: undefined,
      isForce: false,
    });
  });

  after(async () => {
    await client.Applications.delApplication({
      applicationId,
      applicationName: 'test',
    });
    const firstTestScenarioId = (
      await client.Scenarios.getScenarios({
        scenarioName: 'first-test-scenario',
      })
    ).result[0]?.scenarioId;
    await client.Scenarios.delScenario({
      scenarioId: firstTestScenarioId,
      scenarioName: 'first-test-scenario',
    });
    const secondTestScenarioId = (
      await client.Scenarios.getScenarios({
        scenarioName: 'second-test-scenario',
      })
    ).result[0]?.scenarioId;
    await client.Scenarios.delScenario({
      scenarioId: secondTestScenarioId,
      scenarioName: 'second-test-scenario',
    });
    const pathToAppMetadataFile = path.resolve(
      'voxfiles/.voxengine-ci/applications/test.nikit.voximplant.com',
    );
    rmSync(
      path.join(pathToAppMetadataFile, 'application.metadata.config.json'),
    );
    rmSync(path.join(pathToAppMetadataFile, 'rules.metadata.config.json'));
    await rmdir(pathToAppMetadataFile);
  });

  it('create application metadata file', async () => {
    const pathToAppMetadataDir = path.resolve(
      'voxfiles/.voxengine-ci/applications/test.nikit.voximplant.com',
    );
    const file = readFileSync(
      path.join(pathToAppMetadataDir, 'application.metadata.config.json'),
      'utf-8',
    );

    applicationId = (
      await client.Applications.getApplications({ applicationName: 'test' })
    ).result[0].applicationId;
    expect(file).to.equal(
      `{"applicationId":${applicationId},"applicationName":"test.nikit.voximplant.com"}`,
    );
  });

  it('create scenario metadata file', async () => {
    const pathToAppMetadataFile = path.resolve(
      'voxfiles/.voxengine-ci/scenarios/dist',
    );
    const file = readFileSync(
      path.join(
        pathToAppMetadataFile,
        'first-test-scenario.metadata.config.json',
      ),
      'utf-8',
    );

    const scenarioId = (
      await client.Scenarios.getScenarios({
        scenarioName: 'first-test-scenario',
      })
    ).result[0].scenarioId;
    const scenarioScript = (
      await client.Scenarios.getScenarios({
        scenarioId,
        withScript: true,
      })
    ).result[0].scenarioScript;
    const hash = createHash('sha256').update(scenarioScript).digest('hex');
    expect(file).to.equal(
      `{"scenarioId":${scenarioId},"scenarioName":"first-test-scenario","hash":"${hash}"}`,
    );
  });

  it('create rules metadata file', async () => {
    const pathToAppMetadataDir = path.resolve(
      'voxfiles/.voxengine-ci/applications/test.nikit.voximplant.com',
    );
    const file = readFileSync(
      path.join(pathToAppMetadataDir, 'rules.metadata.config.json'),
      'utf-8',
    );
    const { ruleId, scenarios } = (
      await client.Rules.getRules({
        applicationId,
        applicationName: 'test',
        ruleName: 'first-rule',
        withScenarios: true,
      })
    ).result[0];
    // @ts-expect-error: Nodejs mapper error (snake_case to camelCase)
    expect(file).to.equal(`[{"ruleName":"first-rule","ruleId":${ruleId},"scenarios":[{"scenarioName":"second-test-scenario","scenarioId":${scenarios[0].scenario_id}},{"scenarioName":"first-test-scenario","scenarioId":${scenarios[1].scenario_id}}],"rulePattern":"RULE_ONE_.*"}]`,);
  });
});

describe('throw error if app or rule does not exist', async () => {
  let client: VoximplantApiClient;
  let application: ApplicationModule;
  let applicationId: number;
  let firstTestRuleId: number;
  let secondTestRuleId: number;

  before(async () => {
    use(chaiAsPromised);
    client = new VoximplantApiClient('vox_ci_credentials.json');
    await new Promise((resolve) => {
      client.onReady = () => {
        resolve(1);
      };
    });
    application = new ApplicationModule();
    await application.init();
    await application.projectCleanup();
    await application.projectInit();
    // create scenarios
    const scenariosSrcPath = 'voxfiles/scenarios/src';
    const firstTestScenario = 'const first = 1;';
    const secondTestScenario = 'const second = 2;';
    writeFileSync(
      path.join(scenariosSrcPath, 'first-test-scenario.voxengine.js'),
      firstTestScenario,
    );
    writeFileSync(
      path.join(scenariosSrcPath, 'second-test-scenario.voxengine.js'),
      secondTestScenario,
    );
    // create application and rules
    const appConfigDirPath = path.resolve(
      'voxfiles/applications/test.nikit.voximplant.com',
    );
    if (!existsSync(appConfigDirPath)) await mkdir(appConfigDirPath);
    const appConfig = '{"applicationName":"test.nikit.voximplant.com"}';
    writeFileSync(
      path.join(appConfigDirPath, 'application.config.json'),
      appConfig,
    );
    const rulesConfig =
      '[{"ruleName":"first-test-rule","scenarios":["second-test-scenario","first-test-scenario"],"rulePattern":"RULE_ONE_.*"},{"ruleName":"second-test-rule","scenarios":["first-test-scenario"],"rulePattern":"RULE_TWO_.*"}]';
    writeFileSync(
      path.join(appConfigDirPath, 'rules.config.json'),
      rulesConfig,
    );
    await application.applicationBuildAndUpload({
      applicationName: 'test',
      applicationId: undefined,
      isForce: false,
    });
    applicationId = (
      await client.Applications.getApplications({ applicationName: 'test' })
    ).result[0].applicationId;
    firstTestRuleId = (
      await client.Rules.getRules({
        applicationName: 'test',
        applicationId,
        ruleName: 'first-test-rule',
      })
    ).result[0]?.ruleId;
  });

  after(async () => {
    await client.Applications.delApplication({
      applicationId,
      applicationName: 'test',
    });
    const firstTestScenarioId = (
      await client.Scenarios.getScenarios({
        scenarioName: 'first-test-scenario',
      })
    ).result[0]?.scenarioId;
    await client.Scenarios.delScenario({
      scenarioId: firstTestScenarioId,
      scenarioName: 'first-test-scenario',
    });
    const secondTestScenarioId = (
      await client.Scenarios.getScenarios({
        scenarioName: 'second-test-scenario',
      })
    ).result[0]?.scenarioId;
    await client.Scenarios.delScenario({
      scenarioId: secondTestScenarioId,
      scenarioName: 'second-test-scenario',
    });
    const pathToAppMetadataFile = path.resolve(
      'voxfiles/.voxengine-ci/applications/test.nikit.voximplant.com',
    );
    rmSync(
      path.join(pathToAppMetadataFile, 'application.metadata.config.json'),
    );
    rmSync(path.join(pathToAppMetadataFile, 'rules.metadata.config.json'));
    await rmdir(pathToAppMetadataFile);
  });

  /**
   * BY APPLICATION
   */

  it('wrong id: npx voxengine-ci upload --application-id 11 --dry-run', async () => {
    const f = () => {
      return application.applicationBuild({
        applicationName: undefined,
        applicationId: 11,
      });
    };
    await expect(f()).to.be.rejectedWith(
      'Application with --application-id "11" does not exist',
    );
  });

  it('wrong name: npx voxengine-ci upload --application-name dd --dry-run', async () => {
    const f = () => {
      return application.applicationBuild({
        applicationName: 'dd',
        applicationId: undefined,
      });
    };
    await expect(f()).to.be.ok;
  });

  it('wrong id: npx voxengine-ci upload --application-name test --application-id 11 --dry-run', async () => {
    const f = () => {
      return application.applicationBuild({
        applicationName: 'test',
        applicationId: 11,
      });
    };
    await expect(f()).to.be.ok;
  });

  it('wrong name: npx voxengine-ci upload --application-name ww --application-id applicationId --dry-run', async () => {
    const f = () => {
      return application.applicationBuild({
        applicationName: 'ww',
        applicationId: 11,
      });
    };
    await expect(f()).to.be.ok;
  });

  it('npx voxengine-ci upload --application-id 11', async () => {
    const f = () => {
      return application.applicationBuildAndUpload({
        applicationName: undefined,
        applicationId: 11,
        isForce: false,
      });
    };
    await expect(f()).to.be.rejectedWith(
      'Application with --application-id "11" does not exist',
    );
  });

  it('npx voxengine-ci upload --application-name ss', async () => {
    const f = () => {
      return application.applicationBuildAndUpload({
        applicationName: 'ss',
        applicationId: undefined,
        isForce: false,
      });
    };
    await expect(f()).to.be.rejectedWith(
      'Cannot add the application with the ss.nikit.voximplant.com "applicationName" to the platform',
    );
  });

  it('npx voxengine-ci upload --application-name test --application-id 11', async () => {
    const f = () => {
      return application.applicationBuildAndUpload({
        applicationName: 'test',
        applicationId: 11,
        isForce: false,
      });
    };
    await expect(f()).to.be.rejectedWith(
      'Application with --application-id "11" does not exist',
    );
  });

  it('wrong name: npx voxengine-ci upload --application-name ww --application-id applicationId', async () => {
    const f = () => {
      return application.applicationBuildAndUpload({
        applicationName: 'ww',
        applicationId: applicationId,
        isForce: false,
      });
    };
    await expect(f()).to.be.ok;
  });

  /**
   * BY RULE
   */

  it('npm run voxengine-ci:dev upload -- --application-name test --rule-id 11 --dry-run', async () => {
    const f = () => {
      return application.applicationByRuleBuild({
        applicationName: 'test',
        applicationId: undefined,
        ruleName: undefined,
        ruleId: 11,
      });
    };
    await expect(f()).to.be.rejectedWith(
      'Rule with --rule-id "11" does not exist',
    );
  });

  it('npm run voxengine-ci:dev upload -- --application-name dd --rule-id firstTestRuleId --dry-run', async () => {
    const f = () => {
      return application.applicationByRuleBuild({
        applicationName: 'dd',
        applicationId: undefined,
        ruleName: undefined,
        ruleId: firstTestRuleId,
      });
    };
    await expect(f()).to.be.rejectedWith(
      `Rule with --rule-id "${firstTestRuleId}" does not exist`,
    );
  });

  it('npm run voxengine-ci:dev upload -- --application-name test --rule-id 11', async () => {
    const f = () => {
      return application.applicationByRuleBuildAndUpload({
        applicationName: 'test',
        applicationId: undefined,
        ruleName: undefined,
        ruleId: 11,
        isForce: false,
      });
    };
    await expect(f()).to.be.rejectedWith(
      'Rule with --rule-id "11" does not exist',
    );
  });

  it('npm run voxengine-ci:dev upload -- --application-name dd --rule-id firstTestRuleId', async () => {
    const f = () => {
      return application.applicationByRuleBuildAndUpload({
        applicationName: 'dd',
        applicationId: undefined,
        ruleName: undefined,
        ruleId: firstTestRuleId,
        isForce: false,
      });
    };
    await expect(f()).to.be.rejectedWith(
      `Rule with --rule-id "${firstTestRuleId}" does not exist`,
    );
  });
});
