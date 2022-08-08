import { after, before, describe, it } from 'mocha';
import VoximplantApiClient from '@voximplant/apiclient-nodejs';
import { ApplicationModule } from '../../lib/modules/application.module';
import { expect, use } from 'chai';
import { existsSync, rmSync, writeFileSync } from 'fs';
import { mkdir, rmdir } from 'fs/promises';
const chaiAsPromised = require('chai-as-promised');
const path = require('path');

describe('throw error if app or rule does not exist', async () => {
  let client: VoximplantApiClient;
  let application: ApplicationModule;
  let applicationId: number;
  let firstTestRuleId: number;

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

  it('yarn voxengine-ci upload --application-id 11 --dry-run', async () => {
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

  it('yarn voxengine-ci upload --application-name dd --dry-run', async () => {
    const f = () => {
      return application.applicationBuild({
        applicationName: 'dd',
        applicationId: undefined,
      });
    };
    await expect(f()).to.be.ok;
  });

  it('yarn voxengine-ci upload --application-name test --application-id 11 --dry-run', async () => {
    const f = () => {
      return application.applicationBuild({
        applicationName: 'test',
        applicationId: 11,
      });
    };
    await expect(f()).to.be.ok;
  });

  it('yarn voxengine-ci upload --application-name ww --application-id applicationId --dry-run', async () => {
    const f = () => {
      return application.applicationBuild({
        applicationName: 'ww',
        applicationId: 11,
      });
    };
    await expect(f()).to.be.ok;
  });

  it('yarn voxengine-ci upload --application-id 11', async () => {
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

  it('yarn voxengine-ci upload --application-name ss', async () => {
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

  it('yarn voxengine-ci upload --application-name test --application-id 11', async () => {
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

  it('yarn voxengine-ci upload --application-name ww --application-id applicationId', async () => {
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

  it('yarn voxengine-ci:dev upload --application-name test --rule-id 11 --dry-run', async () => {
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

  it('yarn voxengine-ci:dev upload --application-name dd --rule-id firstTestRuleId --dry-run', async () => {
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

  it('yarn voxengine-ci:dev upload --application-name test --rule-id 11', async () => {
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

  it('yarn voxengine-ci:dev upload --application-name dd --rule-id firstTestRuleId', async () => {
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
