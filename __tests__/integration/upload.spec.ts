import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import VoximplantApiClient from '@voximplant/apiclient-nodejs';

import {
  VOX_CI_CREDENTIALS_FILE_NAME,
  APPLICATION_NAME,
  FIRST_RULE_NAME,
  FIRST_RULE_PATTERN,
  FIRST_SCENARIO_NAME,
  SECOND_SCENARIO_NAME,
  FIRST_SCENARIO_CODE,
  SECOND_SCENARIO_CODE,
  SCENARIO_SRC_PATH,
  SCENARIO_DIST_PATH,
  RULES_METADATA_FILE_NAME,
  APPLICATION_METADATA_DIRECTORY_RAW_PATH,
  APPLICATION_CONFIG_DIRECTORY_RAW_PATH,
  APPLICATION_METADATA_FILE_NAME,
} from './lib/consts';
import { cleanupPlatform, cleanupFileSystem } from './lib/cleanup';
import { ApplicationModule } from '../../lib/modules/application.module';

describe(`yarn voxengine-ci upload --application-name ${APPLICATION_NAME} \n upload NEW app "${APPLICATION_NAME}" with rule "${FIRST_RULE_NAME}", scenarios "${FIRST_SCENARIO_NAME}", "${SECOND_SCENARIO_NAME}"`, () => {
  let client: VoximplantApiClient;
  let applicationId: number;

  before(async () => {
    // Await for client
    client = new VoximplantApiClient({
      pathToCredentials: VOX_CI_CREDENTIALS_FILE_NAME,
    });
    await new Promise((resolve) => (client.onReady = () => resolve(1)));
    // Cleanup
    await cleanupPlatform(client);
    await cleanupFileSystem();
    // Prepare
    const application = new ApplicationModule();
    await application.init();
    await application.projectCleanup();
    await application.projectInit();
    const appConfigDirPath = resolve(APPLICATION_CONFIG_DIRECTORY_RAW_PATH);
    if (!existsSync(appConfigDirPath)) await mkdir(appConfigDirPath);
    const appConfig = `{"applicationName":"${APPLICATION_NAME}.voxengine.voximplant.com"}`;
    await writeFile(
      join(appConfigDirPath, 'application.config.json'),
      appConfig,
    );
    const rulesConfig = `[{"ruleName":"${FIRST_RULE_NAME}","scenarios":["${SECOND_SCENARIO_NAME}","${FIRST_SCENARIO_NAME}"],"rulePattern":"${FIRST_RULE_PATTERN}"}]`;
    await writeFile(join(appConfigDirPath, 'rules.config.json'), rulesConfig);
    const scenarioDirPath = resolve(SCENARIO_SRC_PATH);
    if (!existsSync(scenarioDirPath)) await mkdir(scenarioDirPath, { recursive: true });
    await writeFile(
      join(SCENARIO_SRC_PATH, `${FIRST_SCENARIO_NAME}.voxengine.js`),
      FIRST_SCENARIO_CODE,
    );
    await writeFile(
      join(SCENARIO_SRC_PATH, `${SECOND_SCENARIO_NAME}.voxengine.js`),
      SECOND_SCENARIO_CODE,
    );
    await application.applicationBuildAndUpload({
      applicationName: APPLICATION_NAME,
      applicationId: applicationId,
      isForce: false,
    });
  });

  it('should create application metadata file', async () => {
    const pathToAppMetadataDir = resolve(
      APPLICATION_METADATA_DIRECTORY_RAW_PATH,
    );
    const file = await readFile(
      join(pathToAppMetadataDir, APPLICATION_METADATA_FILE_NAME),
      'utf-8',
    );

    applicationId = (
      await client.Applications.getApplications({
        applicationName: APPLICATION_NAME,
      })
    ).result[0].applicationId;
    const firstScenarioId = (
      await client.Scenarios.getScenarios({
        scenarioName: FIRST_SCENARIO_NAME,
        applicationId,
      })
    ).result.find(
      (scenario) => scenario.scenarioName === FIRST_SCENARIO_NAME,
    ).scenarioId;
    const secondScenarioId = (
      await client.Scenarios.getScenarios({
        scenarioName: SECOND_SCENARIO_NAME,
        applicationId,
      })
    ).result.find(
      (scenario) => scenario.scenarioName === SECOND_SCENARIO_NAME,
    ).scenarioId;
    const metadata = JSON.parse(file);
    expect(metadata.applicationId).to.equal(applicationId);
    expect(metadata.applicationName).to.equal(
      `${APPLICATION_NAME}.voxengine.voximplant.com`,
    );
    expect(metadata.scenarios).to.have.deep.members([
      { scenarioId: firstScenarioId, scenarioName: FIRST_SCENARIO_NAME },
      { scenarioId: secondScenarioId, scenarioName: SECOND_SCENARIO_NAME },
    ]);
  });

  it('should create scenario metadata file', async () => {
    const pathToAppMetadataFile = resolve(
      SCENARIO_DIST_PATH,
    );
    const file = await readFile(
      join(
        pathToAppMetadataFile,
        `${FIRST_SCENARIO_NAME}.metadata.config.json`,
      ),
      'utf-8',
    );

    const scenarioId = (
      await client.Scenarios.getScenarios({
        scenarioName: FIRST_SCENARIO_NAME,
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
      `{"scenarioId":${scenarioId},"scenarioName":"${FIRST_SCENARIO_NAME}","hash":"${hash}","applicationId":${applicationId}}`,
    );
  });

  it('should create rules metadata file', async () => {
    const pathToAppMetadataDir = resolve(
      APPLICATION_METADATA_DIRECTORY_RAW_PATH,
    );
    const file = await readFile(
      join(pathToAppMetadataDir, RULES_METADATA_FILE_NAME),
      'utf-8',
    );
    const { ruleId, scenarios } = (
      await client.Rules.getRules({
        applicationId,
        applicationName: APPLICATION_NAME,
        ruleName: FIRST_RULE_NAME,
        withScenarios: true,
      })
    ).result[0];
    expect(file).to.equal(
      // @ts-expect-error: Nodejs mapper error (snake_case to camelCase)
      `[{"ruleName":"${FIRST_RULE_NAME}","ruleId":${ruleId},"scenarios":[{"scenarioName":"${SECOND_SCENARIO_NAME}","scenarioId":${scenarios[0].scenario_id}},{"scenarioName":"${FIRST_SCENARIO_NAME}","scenarioId":${scenarios[1].scenario_id}}],"rulePattern":"${FIRST_RULE_PATTERN}"}]`,
    );
  });
});
