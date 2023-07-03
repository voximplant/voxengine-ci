import { after, before, describe, it } from 'mocha';
import VoximplantApiClient from '@voximplant/apiclient-nodejs';
import { ApplicationModule } from '../../lib/modules/application.module';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { mkdir, rmdir } from 'fs/promises';
import { expect } from 'chai';
import { createHash } from 'crypto';

const path = require('path');

describe('yarn voxengine-ci upload --application-name voxengine-ci \n upload NEW app "voxengine-ci" with rule "voxengine-ci", scenarios "second-voxengine-ci-scenario", "first-voxengine-ci-scenario"', async () => {
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
      '[{"ruleName":"first-voxengine-ci-rule","scenarios":["second-voxengine-ci-scenario","first-voxengine-ci-scenario"],"rulePattern":"RULE_ONE_.*"}]';
    writeFileSync(
      path.join(appConfigDirPath, 'rules.config.json'),
      rulesConfig,
    );
    // create scenarios
    const scenariosSrcPath = 'voxfiles/scenarios/src';
    const firstTestScenario = 'const first = 1;';
    const secondTestScenario = 'const second = 2;';
    writeFileSync(
      path.join(
        scenariosSrcPath,
        'first-voxengine-ci-scenario.voxengine.js',
      ),
      firstTestScenario,
    );
    writeFileSync(
      path.join(
        scenariosSrcPath,
        'second-voxengine-ci-scenario.voxengine.js',
      ),
      secondTestScenario,
    );
    await application.applicationBuildAndUpload({
      applicationName: 'voxengine-ci',
      applicationId: undefined,
      isForce: false,
    });
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

  it('should create application metadata file', async () => {
    const pathToAppMetadataDir = path.resolve(
      'voxfiles/.voxengine-ci/applications/voxengine-ci.voxengine.voximplant.com',
    );
    const file = readFileSync(
      path.join(pathToAppMetadataDir, 'application.metadata.config.json'),
      'utf-8',
    );

    applicationId = (
      await client.Applications.getApplications({
        applicationName: 'voxengine-ci',
      })
    ).result[0].applicationId;
    expect(file).to.equal(
      `{"applicationId":${applicationId},"applicationName":"voxengine-ci.voxengine.voximplant.com"}`,
    );
  });

  it('should create scenario metadata file', async () => {
    const pathToAppMetadataFile = path.resolve(
      'voxfiles/.voxengine-ci/scenarios/dist',
    );
    const file = readFileSync(
      path.join(
        pathToAppMetadataFile,
        'first-voxengine-ci-scenario.metadata.config.json',
      ),
      'utf-8',
    );

    const scenarioId = (
      await client.Scenarios.getScenarios({
        scenarioName: 'first-voxengine-ci-scenario',
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
      `{"scenarioId":${scenarioId},"scenarioName":"first-voxengine-ci-scenario","hash":"${hash}"}`,
    );
  });

  it('should create rules metadata file', async () => {
    const pathToAppMetadataDir = path.resolve(
      'voxfiles/.voxengine-ci/applications/voxengine-ci.voxengine.voximplant.com',
    );
    const file = readFileSync(
      path.join(pathToAppMetadataDir, 'rules.metadata.config.json'),
      'utf-8',
    );
    const { ruleId, scenarios } = (
      await client.Rules.getRules({
        applicationId,
        applicationName: 'voxengine-ci',
        ruleName: 'first-voxengine-ci-rule',
        withScenarios: true,
      })
    ).result[0];
    expect(file).to.equal(
      // @ts-expect-error: Nodejs mapper error (snake_case to camelCase)
      `[{"ruleName":"first-voxengine-ci-rule","ruleId":${ruleId},"scenarios":[{"scenarioName":"second-voxengine-ci-scenario","scenarioId":${scenarios[0].scenario_id}},{"scenarioName":"first-voxengine-ci-scenario","scenarioId":${scenarios[1].scenario_id}}],"rulePattern":"RULE_ONE_.*"}]`,
    );
  });
});
