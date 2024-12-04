import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';

import VoximplantApiClient from '@voximplant/apiclient-nodejs';

import {
  APPLICATION_NAME,
  FIRST_SCENARIO_NAME,
  SECOND_SCENARIO_NAME,
  VOXFILES_DIRECTORY_RAW_PATH,
} from './consts';

const cleanupPlatform = async (client: VoximplantApiClient) => {
  await client.Applications.getApplications({
    applicationName: APPLICATION_NAME,
  });
  const applicationId = (
    await client.Applications.getApplications({
      applicationName: APPLICATION_NAME,
    })
  )?.result?.[0]?.applicationId;
  if (applicationId) {
    await client.Applications.delApplication({
      applicationId,
      applicationName: APPLICATION_NAME,
    });
    console.info(
      `The ${APPLICATION_NAME} application with '${applicationId}' applicationId is successfully deleted.`,
    );
  }
  const firstScenarioId = (
    await client.Scenarios.getScenarios({
      scenarioName: FIRST_SCENARIO_NAME,
    })
  )?.result?.[0]?.scenarioId;
  if (firstScenarioId) {
    await client.Scenarios.delScenario({
      scenarioId: firstScenarioId,
      scenarioName: FIRST_SCENARIO_NAME,
    });
    console.info(
      `The ${FIRST_SCENARIO_NAME} scenario with '${firstScenarioId}' scenarioId is successfully deleted.`,
    );
  }
  const secondScenarioId = (
    await client.Scenarios.getScenarios({
      scenarioName: SECOND_SCENARIO_NAME,
    })
  )?.result?.[0]?.scenarioId;
  if (secondScenarioId) {
    await client.Scenarios.delScenario({
      scenarioId: secondScenarioId,
      scenarioName: SECOND_SCENARIO_NAME,
    });
    console.info(
      `The ${SECOND_SCENARIO_NAME} scenario with '${secondScenarioId}' scenarioId is successfully deleted.`,
    );
  }
};

const cleanupFileSystem = async () => {
  const voxFilesDirectoryPath = resolve(VOXFILES_DIRECTORY_RAW_PATH);
  if (existsSync(voxFilesDirectoryPath)) {
    try {
      await rm(voxFilesDirectoryPath, { recursive: true, force: true });
      console.info(
        `The voxFiles directory (with all included files) by '${voxFilesDirectoryPath}' path is successfully removed.`,
      );
    } catch ({ message }) {
      console.error(`Error removing vox files directory: ${message}`);
    }
  }
};

export { cleanupPlatform, cleanupFileSystem };
