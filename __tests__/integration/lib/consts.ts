const VOX_CI_CREDENTIALS_FILE_NAME = 'vox_ci_credentials.json';
const VOXFILES_DIRECTORY_RAW_PATH = `voxfiles`;
const APPLICATION_NAME = 'voxengine-ci';
const FIRST_RULE_NAME = 'first-voxengine-ci-rule';
const SECOND_RULE_NAME = 'second-voxengine-ci-rule';
const FIRST_RULE_PATTERN = 'RULE_ONE_.*';
const SECOND_RULE_PATTERN = 'RULE_TWO_.*';
const FIRST_SCENARIO_NAME = 'first-voxengine-ci-scenario';
const SECOND_SCENARIO_NAME = 'second-voxengine-ci-scenario';
const FIRST_SCENARIO_CODE = 'const first = 1;';
const SECOND_SCENARIO_CODE = 'const second = 2;';
const SCENARIO_SRC_PATCH = 'voxfiles/scenarios/src';
const APPLICATION_METADATA_FILE_NAME = 'application.metadata.config.json';
const RULES_METADATA_FILE_NAME = 'rules.metadata.config.json';
const APPLICATION_METADATA_DIRECTORY_RAW_PATH = `voxfiles/.voxengine-ci/applications/${APPLICATION_NAME}.voxengine.voximplant.com`;
const APPLICATION_CONFIG_DIRECTORY_RAW_PATH = `voxfiles/applications/${APPLICATION_NAME}.voxengine.voximplant.com`;

export {
  VOX_CI_CREDENTIALS_FILE_NAME,
  VOXFILES_DIRECTORY_RAW_PATH,
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
  APPLICATION_METADATA_FILE_NAME,
  RULES_METADATA_FILE_NAME,
  APPLICATION_METADATA_DIRECTORY_RAW_PATH,
  APPLICATION_CONFIG_DIRECTORY_RAW_PATH,
};
