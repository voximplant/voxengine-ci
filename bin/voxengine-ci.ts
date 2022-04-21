#!/usr/bin/env node

import { exit } from 'process';
import { program } from 'commander';
import chalk from 'chalk';

import {
  ApplicationBuildJobSettings,
  ApplicationBuildAndUploadJobSettings,
  ApplicationByRuleBuildJobSettings,
  ApplicationByRuleBuildAndUploadJobSettings,
} from '../lib/domains/types/job-settings.type';
import { ApplicationModule } from '../lib/modules/application.module';

program
  .command('init')
  .option('--force')
  .action(async ({ force }) => {
    const application = new ApplicationModule();
    await application.init();
    if (force) {
      await application.projectCleanup();
    }
    await application.projectInit();
  });

program
  .command('upload')
  .option('--force')
  .option('--dry-run')
  .option('--application-name <name>')
  .option('--application-id <id>', '', (value) => Number(value))
  .option('--rule-name <name>')
  .option('--rule-id <id>', '', (value) => Number(value))
  .action(async (currentJobSettings: Record<string, unknown>) => {
    if (
      !currentJobSettings.applicationName &&
      !currentJobSettings.applicationId
    ) {
      console.log(
        chalk.white.bgRed(
          `No application parameters are set. Either '--application-name' or '--application-id' must be specified`,
        ),
      );
      exit(1);
    }
    const application = new ApplicationModule();
    await application.init();

    // TODO: Need to make '--force' flagged jobs interactive (user must send 'yes' in the terminal)
    const isForce = currentJobSettings.force;
    const isDryRun = currentJobSettings.dryRun;
    const isRuleSpecified =
      currentJobSettings.ruleName || currentJobSettings.ruleId;
    if (isRuleSpecified) {
      if (isDryRun) {
        await application.applicationByRuleBuild(
          <ApplicationByRuleBuildJobSettings>currentJobSettings,
        );
      }
      if (!isDryRun) {
        currentJobSettings.isForce = isForce;
        await application.applicationByRuleBuildAndUpload(
          <ApplicationByRuleBuildAndUploadJobSettings>currentJobSettings,
        );
      }
    }
    if (!isRuleSpecified) {
      if (isDryRun) {
        await application.applicationBuild(
          <ApplicationBuildJobSettings>currentJobSettings,
        );
      }
      if (!isDryRun) {
        currentJobSettings.isForce = isForce;
        await application.applicationBuildAndUpload(
          <ApplicationBuildAndUploadJobSettings>currentJobSettings,
        );
      }
    }
  })
  .configureOutput({
    outputError: (str, write) =>
      write(chalk.bgRed(`Error occurred: ${str.split('error: ')[1]}`)),
  });

program.parse();
