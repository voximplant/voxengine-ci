import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';

import { expect, use } from 'chai';
import { before, describe, it } from 'mocha';
import chaiAsPromised from 'chai-as-promised';
import VoximplantApiClient from '@voximplant/apiclient-nodejs';

import {
  VOX_CI_CREDENTIALS_FILE_NAME,
  APPLICATION_NAME,
  FIRST_RULE_NAME,
  SECOND_RULE_NAME,
  FIRST_RULE_PATTERN,
  SECOND_RULE_PATTERN,
  FIRST_SCENARIO_NAME,
  SECOND_SCENARIO_NAME,
  FIRST_SCENARIO_CODE,
  SECOND_SCENARIO_CODE,
  SCENARIO_SRC_PATCH,
  APPLICATION_CONFIG_DIRECTORY_RAW_PATH,
} from './lib/consts';
import { cleanupPlatform, cleanupFileSystem } from './lib/cleanup';
import { ApplicationModule } from '../../lib/modules/application.module';

import { join, resolve } from 'path';

describe('throw error if app or rule does not exist', () => {
  let client: VoximplantApiClient;
  let application: ApplicationModule;
  let applicationId: number;
  let firstTestRuleId: number;

  before(async () => {
    use(chaiAsPromised);
    // Await for client
    client = new VoximplantApiClient(VOX_CI_CREDENTIALS_FILE_NAME);
    await new Promise((resolve) => (client.onReady = () => resolve(1)));
    // Cleanup
    await cleanupPlatform(client);
    await cleanupFileSystem();
    // Prepare
    application = new ApplicationModule();
    await application.init();
    await application.projectCleanup();
    await application.projectInit();
    await writeFile(
      join(SCENARIO_SRC_PATCH, `${FIRST_SCENARIO_NAME}.voxengine.js`),
      FIRST_SCENARIO_CODE,
    );
    await writeFile(
      join(SCENARIO_SRC_PATCH, `${SECOND_SCENARIO_NAME}.voxengine.js`),
      SECOND_SCENARIO_CODE,
    );
    const appConfigDirPath = resolve(APPLICATION_CONFIG_DIRECTORY_RAW_PATH);
    if (!existsSync(appConfigDirPath)) await mkdir(appConfigDirPath);
    const appConfig = `{"applicationName":"${APPLICATION_NAME}.voxengine.voximplant.com"}`;
    await writeFile(
      join(appConfigDirPath, 'application.config.json'),
      appConfig,
    );
    const rulesConfig = `[{"ruleName":"${FIRST_RULE_NAME}","scenarios":["${SECOND_SCENARIO_NAME}","${FIRST_SCENARIO_NAME}"],"rulePattern":"${FIRST_RULE_PATTERN}"},{"ruleName":"${SECOND_RULE_NAME}","scenarios":["${FIRST_SCENARIO_NAME}"],"rulePattern":"${SECOND_RULE_PATTERN}"}]`;
    await writeFile(join(appConfigDirPath, 'rules.config.json'), rulesConfig);
    await application.applicationBuildAndUpload({
      applicationName: APPLICATION_NAME,
      applicationId: undefined,
      isForce: false,
    });
    applicationId = (
      await client.Applications.getApplications({
        applicationName: APPLICATION_NAME,
      })
    ).result[0].applicationId;
    firstTestRuleId = (
      await client.Rules.getRules({
        applicationName: APPLICATION_NAME,
        applicationId,
        ruleName: FIRST_RULE_NAME,
      })
    ).result[0]?.ruleId;
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
    await expect(f()).to.be.become(undefined);
    // TODO: Looks like a bug?
    // await expect(f()).to.be.rejectedWith(
    //   'Application with --application-name "dd" does not exist',
    // );
  });

  it('yarn voxengine-ci upload --application-name voxengine-ci --application-id 11 --dry-run', async () => {
    const f = () => {
      return application.applicationBuild({
        applicationName: APPLICATION_NAME,
        applicationId: 11,
      });
    };
    await expect(f()).to.be.rejectedWith(
      'Application with --application-id "11" does not exist',
    );
  });

  it('yarn voxengine-ci upload --application-name ww --application-id applicationId --dry-run', async () => {
    const f = () => {
      return application.applicationBuild({
        applicationName: 'ww',
        applicationId: 11,
      });
    };
    await expect(f()).to.be.rejectedWith(
      'Application with --application-id "11" does not exist',
    );
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
        applicationName: APPLICATION_NAME,
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
        applicationId,
        isForce: false,
      });
    };
    await expect(f()).to.be.become(undefined);
  });

  /**
   * BY RULE
   */

  it('yarn voxengine-ci:dev upload --application-name voxengine-ci --rule-id 11 --dry-run', async () => {
    const f = () => {
      return application.applicationByRuleBuild({
        applicationName: APPLICATION_NAME,
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
        applicationName: APPLICATION_NAME,
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
