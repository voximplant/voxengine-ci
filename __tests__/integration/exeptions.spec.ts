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
      path.join(scenariosSrcPath, 'first-voxengine-ci-scenario.voxengine.js'),
      firstTestScenario,
    );
    writeFileSync(
      path.join(scenariosSrcPath, 'second-voxengine-ci-scenario.voxengine.js'),
      secondTestScenario,
    );
    // create application and rules
    const appConfigDirPath = path.resolve(
      'voxfiles/applications/voxengine-ci.voxengine.voximplant.com',
    );
    if (!existsSync(appConfigDirPath)) await mkdir(appConfigDirPath);
    const appConfig =
      '{"applicationName":"voxengine-ci.voxengine.voximplant.com"}';
    writeFileSync(
      path.join(appConfigDirPath, 'application.config.json'),
      appConfig,
    );
    const rulesConfig =
      '[{"ruleName":"first-voxengine-ci-rule","scenarios":["second-voxengine-ci-scenario","first-voxengine-ci-scenario"],"rulePattern":"RULE_ONE_.*"},{"ruleName":"second-voxengine-ci-rule","scenarios":["first-voxengine-ci-scenario"],"rulePattern":"RULE_TWO_.*"}]';
    writeFileSync(
      path.join(appConfigDirPath, 'rules.config.json'),
      rulesConfig,
    );
    await application.applicationBuildAndUpload({
      applicationName: 'voxengine-ci',
      applicationId: undefined,
      isForce: false,
    });
    applicationId = (
      await client.Applications.getApplications({
        applicationName: 'voxengine-ci',
      })
    ).result[0].applicationId;
    firstTestRuleId = (
      await client.Rules.getRules({
        applicationName: 'voxengine-ci',
        applicationId,
        ruleName: 'first-voxengine-ci-rule',
      })
    ).result[0]?.ruleId;
  });

  after(async () => {
    await client.Applications.delApplication({
      applicationId,
      applicationName: 'voxengine-ci',
    });
    const firstTestScenarioId = (
      await client.Scenarios.getScenarios({
        scenarioName: 'first-voxengine-ci-scenario',
      })
    ).result[0]?.scenarioId;
    await client.Scenarios.delScenario({
      scenarioId: firstTestScenarioId,
      scenarioName: 'first-voxengine-ci-scenario',
    });
    const secondTestScenarioId = (
      await client.Scenarios.getScenarios({
        scenarioName: 'second-voxengine-ci-scenario',
      })
    ).result[0]?.scenarioId;
    await client.Scenarios.delScenario({
      scenarioId: secondTestScenarioId,
      scenarioName: 'second-voxengine-ci-scenario',
    });
    const pathToAppMetadataFile = path.resolve(
      'voxfiles/.voxengine-ci/applications/voxengine-ci.voxengine.voximplant.com',
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

  it('yarn voxengine-ci upload --application-name voxengine-ci --application-id 11 --dry-run', async () => {
    const f = () => {
      return application.applicationBuild({
        applicationName: 'voxengine-ci',
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
      'Cannot add the application with the ss.voxengine.voximplant.com "applicationName" to the platform',
    );
  });

  it('yarn voxengine-ci upload --application-name voxengine-ci --application-id 11', async () => {
    const f = () => {
      return application.applicationBuildAndUpload({
        applicationName: 'voxengine-ci',
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

  it('yarn voxengine-ci:dev upload --application-name voxengine-ci --rule-id 11 --dry-run', async () => {
    const f = () => {
      return application.applicationByRuleBuild({
        applicationName: 'voxengine-ci',
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

  it('yarn voxengine-ci:dev upload --application-name voxengine-ci --rule-id 11', async () => {
    const f = () => {
      return application.applicationByRuleBuildAndUpload({
        applicationName: 'voxengine-ci',
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
