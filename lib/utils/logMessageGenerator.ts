import chalk from 'chalk';

export const messages: Record<string, string> = {
  /**
   * APPLICATION ERRORS
   */

  ERR__APP_BY_NAME_DOES_NOT_EXIST: `Application with --application-name "{1}" does not exist`,

  ERR__APP_BY_ID_DOES_NOT_EXIST: `Application with --application-id "{1}" does not exist`,

  ERR__APP_BY_NAME_ON_CREATE_DOES_NOT_EXIST: `${chalk.yellow(
    `Application with --application-name "{1}" does not exist; if you want to create a new application, add application.config.json and rules.config.json in directory /voxfiles/applications/{1}`,
  )}`,

  ERR__APP_NAME_IN_APP_CONFIG_IS_DIFFERENT: `${chalk.red(
    'The "{1}" applicationName in application.config file is different from the "{2}"',
  )}`,

  ERR__APP_DATA_FORMAT_IS_NOT_VALID: `Data of the application with --application-name "{1}" is not in a valid format`,

  ERR__APP_METADATA_FORMAT_IS_NOT_VALID: `Metadata of the application with --application-name "{1}" is not in a valid format`,

  ERR__CANNOT_ADD_APP: `${chalk.red(
    'Cannot add the application with the {1} "applicationName" to the platform',
  )}`,

  /**
   * RULES ERRORS
   */

  ERR__RULE_ID_DOES_NOT_EXIST: `Rule with --rule-id "{1}" does not exist`,

  ERR__RULE_NAME_DOES_NOT_EXIST: `Rule with --rule-name "{1}" does not exist`,

  /**
   * SCENARIOS ERRORS
   */

  ERR__SCENARIO_DOES_NOT_EXIST: `${chalk.blue(
    'The "{1}" scenario does not exist',
  )}`,

  ERR__SCENARIO_ALREADY_EXISTS: `Scenario with the {1} "scenarioName" already exists on the platform`,

  ERR__CANNOT_ADD_SCENARIO: `${chalk.red(
    `Cannot add the scenario with the ${chalk.blue(
      '{1} "scenarioName"',
    )} to the platform`,
  )}`,

  ERR__CANNOT_UPDATE_SCENARIO: `${chalk.red(
    'Cannot update the scenario with the {1} "scenarioName" and {2} "scenarioId" on the platform',
  )}`,

  ERR__SCENARIO_BY_ID_IS_NOT_FOUND: `Scenario with the {1} "scenarioId' is NOT found on the platform`,

  ERR__SCENARIO_BY_NAME_IS_NOT_FOUND: `Scenario with the {1} "scenarioName" is NOT found on the platform`,

  ERR__SCENARIO_DIST_IS_NOT_FOUND: `Scenario with the ${chalk.blue(
    '{1}',
  )} 'scenarioName' dist does not exist`,

  ERR__SCENARIO_IS_NOT_ADDED: `Scenario with the {1} "scenarioName" has NOT been added to the platform, something went wrong`,

  ERR__SCENARIO_BY_NAME_IS_NOT_FOUND_AFTER_ADDING: `Scenario with the {1} "scenarioName" has NOT been found on the platform (immediately after adding), something went wrong`,

  ERR__SCENARIO_BY_ID_AND_NAME_IS_NOT_FOUND_AFTER_ADDING: `Scenario with the {1} "scenarioId" and {2} "scenarioName" has NOT been found on the platform (immediately after adding), something went wrong`,

  ERR__SCENARIO_IS_CHANGED_FROM_THE_PLATFORM: `Scenario with the {1} "scenarioId" and {2} "scenarioName" has been already changed from the platform, operation is aborted`,

  ERR__SCENARIO_IS_NOT_UPDATED: `Scenario with the {1} "scenarioName" and {2} "scenarioId" has NOT been updated on the platform, something went wrong`,

  ERR__CANNOT_DOWNLOAD_SCENARIO_BY_ID: `${chalk.yellow(
    'Cannot download the scenario with the {1} "scenarioId" from the platform',
  )}`,

  ERR__CANNOT_DOWNLOAD_SCENARIO_BY_NAME: `${chalk.yellow(
    'Cannot download the scenario with the {1} "scenarioName" from the platform',
  )}`,

  ERR__ADD_SCENARIO_FAILED: `${chalk.red('"{1}.addScenario" has failed')}`,

  ERR__ADD_SCENARIOS_TO_RULE_FAILED: `${chalk.red(
    '"{1}.addScenariosToRule" has failed',
  )}`,

  ERR__UPDATE_SCENARIO_FAILED: `${chalk.red(
    '"{1}.updateScenario" has failed',
  )}`,

  ERR__BIND_SCENARIO_FAILED: `${chalk.red('"{1}.bindScenarios" has failed')}`,

  ERR__CHECK_SCENARIO_ALREADY_EXISTS_FAILED: `${chalk.red(
    '"{1}.checkScenarioAlreadyExists" has failed',
  )}`,

  ERR__DOWNLOAD_SCENARIO_WITH_SCRIPT_FAILED: `${chalk.red(
    '"{1}.downloadScenarioWithScript" has failed',
  )}`,

  ERR__DOWNLOAD_SCENARIO_WITHOUT_SCRIPT_FAILED: `${chalk.red(
    '"{1}.downloadScenarioWithoutScript" has failed',
  )}`,

  ERR__SAVE_SCENARIO_FAILED: `${chalk.red('"{1}.saveScenario" has failed')}`,

  ERR__SAVE_SCENARIO_METADATA_FAILED: `${chalk.red(
    '"{1}.saveScenarioMetadata" has failed',
  )}`,

  ERR__GET_SCENARIOS_METADATA_FAILED: `${chalk.red(
    '"{1}.getScenariosMetadata" has failed',
  )}`,

  ERR__SCENARIOS_COMPILATION_FAILED: `Compilation of the ${chalk.blue(
    '[ {1} ]',
  )} scenarios has failed`,

  /**
   * FILESYSTEM ERRORS
   */

  ERR__UNKNOWN_FORMAT: `Cannot parse an unknown format – "{1}". Available formats: "{2}"`,

  ERR__PATH_FILE_ALREADY_EXISTS: `The "{1}" file already exists`,

  ERR__PATH_METADATA_FILE_ALREADY_EXISTS: `The "{1}" metadata file already exists`,

  ERR__CHECK_EXISTS_FAILED: `${chalk.red('"{1}.checkExists" has failed')}`,

  ERR__CHECK_METADATA_EXISTS_FAILED: `${chalk.red(
    '"{1}.checkMetadataExists" has failed',
  )}`,

  ERR__CANNOT_TRANSFORM_YML: `${chalk.red('Cannot transform')} ${chalk.blue(
    'YML/YAML',
  )} ${chalk.red('format, wrong data')}`,

  ERR__CANNOT_TRANSFORM_TOML: `${chalk.red('Cannot transform')} ${chalk.blue(
    'TOML',
  )} ${chalk.red('format, wrong data')}`,

  ERR__CREATE_DIRECTORY_FAILED: `${chalk.red(
    '"{1}.createDirectory" has failed',
  )}`,

  ERR__READ_DIRECTORY_FAILED: `${chalk.red('"{1}.readDirectory" has failed')}`,

  ERR__REMOVE_DIRECTORY_FAILED: `${chalk.red(
    '"{1}.removeDirectory" has failed',
  )}`,

  ERR__REMOVE_METADATA_DIRECTORY_FAILED: `${chalk.red(
    '"{1}.removeMetadataDirectory" has failed',
  )}`,

  ERR__CREATE_FILE_FAILED: `${chalk.red('"{1}.createFile" has failed')}`,

  ERR__CREATE_METADATA_FILE_FAILED: `${chalk.red(
    '"{1}.createMetadataFile" has failed',
  )}`,

  ERR__CREATE_OR_UPDATE_FILE_FAILED: `${chalk.red(
    '"{1}.createOrUpdateFile" has failed',
  )}`,

  ERR__CREATE_OR_UPDATE_METADATA_FILE_FAILED: `${chalk.red(
    '"{1}.createOrUpdateMetadataFile" has failed',
  )}`,

  ERR__FILE_DOES_NOT_EXIST: `${chalk.yellow(
    'The "{1}" file does not exist',
  )} (with any available extension)`,

  ERR__METADATA_FILE_DOES_NOT_EXIST: `${chalk.yellow(
    'The "{1}" metadata file does not exist',
  )}`,

  ERR__READ_FILE_FAILED: `${chalk.red('"{1}.readFile" has failed')}`,

  ERR__READ_METADATA_FILE_FAILED: `${chalk.red(
    '"{1}.readMetadataFile" has failed',
  )}`,

  ERR__REMOVE_FILE_FAILED: `${chalk.red('"{1}.removeFile "has failed')}`,

  ERR__REMOVE_METADATA_FILE_FAILED: `${chalk.red(
    '"{1}.removeMetadataFile" has failed',
  )}`,

  ERR__CREATE_FAILED: `${chalk.bgRed('"{1}.create" has failed')}`,

  ERR__CREATE_METADATA_FAILED: `${chalk.bgRed(
    '"{1}.createMetadata" has failed',
  )}`,

  ERR__CREATE_OR_UPDATE_FAILED: `${chalk.bgRed(
    '"{1}.createOrUpdate" has failed',
  )}`,

  ERR__CREATE_OR_UPDATE_METADATA_FAILED: `${chalk.bgRed(
    '"{1}.createOrUpdateMetadata" has failed',
  )}`,

  ERR__READ_FAILED: `${chalk.bgRed('"{1}.read" has failed')}`,

  ERR__READ_METADATA_FAILED: `${chalk.bgRed('"{1}.readMetadata" has failed')}`,

  ERR__CREATE_OR_UPDATE_TSCONFIG_FAILED: `${chalk.red(
    '"{1}.createOrUpdateTsConfig" has failed',
  )}`,

  ERR__READ_SRC_FAILED: `${chalk.red('"{1}.readSrc" has failed')}`,

  ERR__READ_SRC_METADATA_FAILED: `${chalk.red(
    '"{1}.readSrcMetadata" has failed',
  )}`,

  ERR__READ_DIST_FAILED: `${chalk.red('"{1}.readDist" has failed')}`,

  ERR__READ_DIST_METADATA_FAILED: `${chalk.red(
    '"{1}.readDistMetadata" has failed',
  )}`,

  /**
   * PROJECT ERRORS
   */

  ERR__INIT_FAILED: `${chalk.bgRed('"{1}" initialization has failed')}`,
  ERR__INIT_FAILED_WRONG_CREDENTIALS_FILE_FORMAT: `${chalk.bgRed(
    '"{1}" initialization has failed, wrong credentials file format',
  )}`,

  ERR__PROJECT_INIT_FAILED: `${chalk.red('"{1}.projectInit" has failed')}`,

  ERR__PROJECT_CLEANUP_FAILED: `${chalk.red(
    '"{1}.projectCleanup" has failed',
  )}`,

  ERR__PROJECT_IS_ALREADY_INITIALIZED: `Project has already been initialized`,

  ERR__BUILD_FAILED: `${chalk.red('"{1}.build" has failed')}`,

  ERR__UPLOAD_FAILED: `${chalk.red('"{1}.upload" has failed')}`,

  ERR__APPLICATION_BUILD_FAILED: `${chalk.red(
    '"${1}.applicationBuild" has failed',
  )}`,

  ERR__APPLICATION_BUILD_AND_UPLOAD_FAILED: `${chalk.red(
    '"{1}.applicationBuildAndUpload" has failed',
  )}`,

  ERR__APPLICATION_BY_RULE_BUILD_FAILED: `${chalk.red(
    '"{1}.applicationByRuleBuild" has failed',
  )}`,

  ERR__APPLICATION_BY_RULE_BUILD_AND_UPLOAD_FAILED: `${chalk.red(
    '"{1}.applicationByRuleBuildAndUpload" has failed',
  )}`,

  /**
   * API ERRORS
   */

  ERR__VOXIMPLANT_API_ERROR: `${chalk.red('Voximplant API error: "{1}"')}`,

  /**
   * APPLICATION INFO
   */

  INFO__APPLICATIONS_DOWNLOADED: `${chalk.blue(
    'All',
  )} applications have been successfully downloaded from the platform`,

  INFO__APPLICATION_UPLOADED: `Application with the ${chalk.blue(
    '{1}',
  )} "applicationId" and ${chalk.blue(
    '{2}',
  )} "applicationName" has been successfully uploaded to the platform`,

  INFO__NO_APPLICATIONS: `${chalk.yellow('Account has no applications')}`,

  /**
   * RULES INFO
   */

  INFO__APP_DOESNT_HAVE_RULES: `Application with the ${chalk.blue(
    '{1}',
  )} "applicationName" ${chalk.blue('does not have any rules')}.`,

  INFO__RULES_DOWNLOADED: `${chalk.blue(
    'All',
  )} rules of the application with the ${chalk.blue(
    '{1}',
  )} "applicationId" and ${chalk.blue(
    '{2}',
  )} "applicationName" have been successfully downloaded from the platform`,

  INFO__RULE_UPLOADED: `Rule with the ${chalk.blue(
    '{1}',
  )} "ruleId" and ${chalk.blue(
    '{2}',
  )} "ruleName" has been successfully uploaded to the platform`,

  INFO__RULE_UPDATED: `Rule with the ${chalk.blue(
    '{1}',
  )} "ruleId" has been successfully updated on the platform`,

  INFO__RULES_REORDERED: `${chalk.yellow('Rules were reordered: {1}')}`,

  /**
   * SCENARIOS INFO
   */

  INFO__SCENARIOS_DOWNLOADED: `${chalk.blue(
    'All',
  )} scenarios have been successfully downloaded from the platform`,

  INFO__SCENARIO_BY_ID_DOWNLOADED: `Scenario with the ${chalk.blue(
    '{1}',
  )} "scenarioId" has been successfully downloaded from the platform`,

  INFO__SCENARIO_BY_NAME_DOWNLOADED: `Scenario with the ${chalk.blue(
    '{1}',
  )} "scenarioName" has been successfully downloaded from the platform`,

  INFO__SCENARIO_ADDED_TO_TSCONFIG: `${chalk.green(
    'The scenario',
  )} ${chalk.blue('{1}')} ${chalk.green(
    'has been successfully added to the current',
  )} ${chalk.yellow('{2}')} ${chalk.green('file')}'`,

  INFO__SCENARIO_ADDED: `Scenario with the ${chalk.blue(
    '{1}',
  )} "scenarioName" has been successfully added to the platform`,

  INFO__SCENARIO_UPDATED: `${chalk.green('Scenario with the')} ${chalk.blue(
    '{1}',
  )} ${chalk.green('"scenarioId" and')} ${chalk.blue('{2}')} ${chalk.green(
    '"scenarioName" has been successfully updated on the platform',
  )}`,

  INFO__SCENARIOS_BOUND: `${chalk.green('Scenarios with the')} ${chalk.blue(
    '{1}',
  )} ${chalk.green('"scenarioId" and')} ${chalk.blue('{2}')} ${chalk.green(
    '"scenarioName" have been successfully attached to the rule with the',
  )} ${chalk.blue('{3}')} ${chalk.green('"ruleName"')}`,

  INFO__SCENARIOS_DETACHED: `${chalk.green('Scenarios with the')} ${chalk.blue(
    '{1}',
  )} ${chalk.green('"scenarioId" and')} ${chalk.blue('{2}')} ${chalk.green(
    '"scenarioName" have been successfully detached from the rule with the',
  )} ${chalk.blue('{3}')} ${chalk.green('"ruleName"')}`,

  INFO__SCENARIOS_BUILT: `${chalk.green(
    `Scenarios ${chalk.blue('[ {1} ]')} have been successfully built`,
  )}`,

  INFO__SCENARIO_NOT_CHANGED: `Scenario with the ${chalk.blue(
    '{1}',
  )} "scenarioName" was NOT changed locally. The operation will be skipped`,

  INFO__SCENARIO_CHANGED: `${chalk.yellow(
    `Scenario with the ${chalk.blue(
      '{1}',
    )} "scenarioName" was changed locally. The new version will be uploaded to the platform`,
  )}`,

  INFO__SCENARIO_FORCE_CHANGE: `${chalk.black.bgYellow(
    'WARNING!!! The ',
  )}${chalk.white.bgYellow('"--force"')}${chalk.black.bgYellow(
    ' flag has been used!!!',
  )} The scenario with the ${chalk.blue('{1}')} "scenarioId" and ${chalk.blue(
    '{2}',
  )} "scenarioName" was changed from the platform, ${chalk.red(
    'BUT the operation has NOT be aborted',
  )} because of the ${chalk.yellow('"--force"')} flag`,

  INFO__SAME_SCENARIOS: `${chalk.red(
    'Rename these scenarios on the platform considering that file names are case-insensitive:',
  )} ${chalk.blue('{1}')}`,

  /**
   * FILESYSTEM INFO
   */

  INFO__ROOT_DIRECTORY_IS_CREATED: `The ${chalk.blue('{1}')} ${chalk.yellow(
    'root',
  )} directory has been successfully created`,

  INFO__ROOT_DIRECTORY_METADATA_IS_CREATED: `The ${chalk.blue(
    '{1}',
  )} ${chalk.yellow('root metadata')} directory has been successfully created`,

  INFO__DIRECTORY_IS_CREATED: `${chalk.green('The')} ${chalk.blue(
    '{1}',
  )} ${chalk.green('directory has been successfully created')}`,

  INFO__METADATA_DIRECTORY_IS_CREATED: `${chalk.green('The')} ${chalk.blue(
    '{1}',
  )} ${chalk.green('metadata directory has been successfully created')}`,

  INFO__TRANSFORM_YML_DATA: `Transforming the ${chalk.blue(
    'YML/YAML',
  )} data...`,

  INFO__TRANSFORM_TOML_DATA: `Transforming the ${chalk.blue('TOML')} data...`,

  INFO__DIRECTORY_IS_REMOVED: `${chalk.green('The')} ${chalk.blue(
    '{1}',
  )} ${chalk.green('directory has been successfully removed')}`,

  INFO__METADATA_DIRECTORY_IS_REMOVED: `${chalk.green('The')} ${chalk.blue(
    '{1}',
  )} ${chalk.green('metadata directory has been successfully removed')}`,

  INFO__FILE_IS_CREATED: `${chalk.green('The')} ${chalk.blue(
    '{1}',
  )} ${chalk.green('file has been successfully created')}`,

  INFO__METADATA_FILE_IS_CREATED: `${chalk.green('The')} ${chalk.blue(
    '{1}',
  )} ${chalk.green('metadata file has been successfully created')}`,

  INFO__FILE_IS_CREATED_OR_UPDATED: `${chalk.green('The')} ${chalk.blue(
    '{1}',
  )} ${chalk.green('file has been successfully created (or updated)')}`,

  INFO__METADATA_FILE_IS_CREATED_OR_UPDATED: `${chalk.green(
    'The',
  )} ${chalk.blue('{1}')} ${chalk.green(
    'metadata file has been successfully created (or updated)',
  )}`,

  INFO__FILE_IS_REMOVED: `${chalk.green('The')} ${chalk.blue(
    '{1}',
  )} ${chalk.green('file has been successfully removed')}`,

  INFO__METADATA_FILE_IS_REMOVED: `${chalk.green('The')} ${chalk.blue(
    '{1}',
  )} ${chalk.green('metadata file has been successfully removed')}`,

  /**
   * PROJECT INFO
   */

  INFO__INIT_SUCCESS: `${chalk.black.bgGreen(
    'The "{1}" has been successfully initialized',
  )}`,
};

export class LogMessageGeneratorFactory {
  private static instance: LogMessageGeneratorFactory;
  list: Record<string, string>;

  constructor() {
    this.list = messages;
  }

  public static getInstance() {
    return this.instance || (this.instance = new LogMessageGeneratorFactory());
  }

  format(str: string, ...args: string[]) {
    return str.replace(/{(\d+)}/g, (match, i) =>
      typeof args[i - 1] !== 'undefined' ? args[i - 1] : match,
    );
  }

  generate(message = '', ...args: string[]) {
    if (message === '') {
      return message;
    }
    for (const key in this.list) {
      if (message === key) {
        return this.format(this.list[key], ...args);
      }
    }
    return message;
  }
}
