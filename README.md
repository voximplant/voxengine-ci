# VOXENGINE-CI

Manage [Voximplant Platform](https://voximplant.com/platform) `applications`, `rules`, and `scenarios` from your own environment using [@voximplant/apiclient-nodejs](https://www.npmjs.com/package/@voximplant/apiclient-nodejs) under the hood.

---

## Installation

```shell
  npm i @voximplant/voxengine-ci
```

---

## Service account

Go to the [Service accounts](https://manage.voximplant.com/settings/service_accounts) section of the control panel and generate a file with your account credentials. Learn more about service accounts [here](https://voximplant.com/docs/howtos/integration/httpapi/auth)

## Configuration

Create a `.env` file in the root directory of your project and add environment-specific variables:

```shell
  VOX_CI_CREDENTIALS=/path/to/the/vox_ci_credentials.json
  VOX_CI_ROOT_PATH=/path/to/the/voxengine_ci_source_files_directory
```

- VOX_CI_CREDENTIALS - path to your `json` credentials file (`vox_ci_credentials.json` by default)
- VOX_CI_ROOT_PATH - path to the directory where the `vox` files will be located (`voxfiles` by default)

Creating a .env file is not necessary if you move the file with credentials to your project folder and it has a default name – `vox_ci_credentials.json`. 
The folder with the files created after initialization will be placed in your project folder as well and will be named `voxfiles` unless you decide to create a .env variable and specify something different there.

---

## Usage

First, initialize the project (download all files and metadata from your VoxImplant account). When all the files have been successfully downloaded from the platform, you can modify them and upload them back to the platform. Read the __scripts__ paragraph to learn more.

Read the full [Voxengine CI](https://voximplant.com/docs/guides/voxengine/ci) guide for more details.

### Creating a new application

Create an `application.config.json` file in the `/path/to/the/voxengine_ci_source_files_directory/applications/your-application-name.your-account-name.voximplant.com/` directory, where `/path/to/the/voxengine_ci_source_files_directory` is created with the `npx voxengine-ci init` command (you specified this path in the `VOX_CI_ROOT_PATH` env variable). Then, add the following config to this file:

```shell
  {"applicationName":"your-application-name.your-account-name.voximplant.com"}
```

In the same directory, create a `rules.config.json` file with this config:

```shell
  [
    { "ruleName":"first-rule","scenarios":["first-scenario"],"rulePattern":"string-with-regexp" },
    { "ruleName":"second-rule","scenarios":["second-scenario"],"rulePattern":"string-with-regexp" }
  ]
```

where `first-rule` and `second-rule` are the names of your rules, `first-scenario` and `second-scenario` are the names of your scenarios (you can change them in the `/scenarios/src` directory), `string-with-regexp` is a regular expression to validate caller IDs in inbound calls (".*" by default).

You can modify existing scenarios and create new ones ONLY in the `/voxfiles/scenarios/src` directory. Only the scenarios having their names specified in `rules.config.json` will be uploaded to the platform. The scenario file names should match the *.voxengine.{js,ts} pattern. These are the files where you write the scenarios code.

When configs and scenarios are ready, run

```shell
  npx voxengine-ci upload --application-name your-application-name
```

to upload this new application with all rules and scenarios to the platform.

You can also use the `--dry-run` flag in this and the following command to build the project locally without uploading changes to the platform.

## Modifying an application and its rules

When an application is uploaded to the platform, you can add/modify rules (configure them in `rules.config.json`) and scenarios (in /scenarios/src) and run the previous command to upload the changes. If you specify a rule name or rule id in the command, only the scenarios attached to this rule will be uploaded to the platform:

```shell
  npx voxengine-ci upload --application-name your-application-name --rule-name your-rule-name
```
It works either when you upload a new rule or when you modify an existing one.

If you modify an existing application or existing rule, you can specify `--application-id` and `--rule-id` instead of `-application-name` and `--rule-name`:

```shell
  npx voxengine-ci upload --application-id your-application-id --rule-id your-rule-id
```

When you change the name of an application, scenario, or rule using Voxengine CI, a new app, scenario, and rule with the same content is created on the platform. The old one is not deleted or changed due to the Voxengine CI inner logic. 

You can modify these old apps, scenarios, and rules only from the platform without sharing the changes with Voxengine CI (NOT RECOMMENDED) unless you run `npx voxengine-ci init --force` to make your local and remote versions consistent.

---

## Scripts

### Initialize the project

```shell
  npx voxengine-ci init
```

### Initialize the project from scratch, deleting all existing files and configurations

```shell
  npx voxengine-ci init --force
```

### Build application scenarios (by specifying _application-name_) for ALL application rules without uploading to the platfrom

```shell
  npx voxengine-ci upload --application-name your_application_name --dry-run
```

### Build application scenarios (by specifying _rule-name_) for a specified application rule without uploading to the platfrom

```shell
  npx voxengine-ci upload --application-name your_application_name --rule-name your_rule_name --dry-run
```

### Build and upload application scenarios (by specifying _application-name_) for ALL application rules

```shell
  npx voxengine-ci upload --application-name your_application_name
```

### Build and upload application scenarios (by specifying _application-name_ and _rule-name_) for a specified application rule

```shell
  npx voxengine-ci upload --application-name your_application_name --rule-name your_rule_name
```

### Build and __force__ upload application scenarios (by specifying _application-name_) for ALL application rules

This command is useful if scenarios have been modified on the platform without using voxengine-ci and you are going to overwrite those changes.

```shell
  npx voxengine-ci upload --application-name your_application_name --force
```

### Build and __force__ upload application scenarios (by specifying _rule-name_) for a specified rule

This command is useful if scenarios have been modified on the platform without using voxengine-ci and you are going to overwrite those changes.

```shell
  npx voxengine-ci upload --application-name your_application_name --rule-name your_rule-name --force
```

`--application-id` and `--rule-id` flags can be used instead of `--application-name` and `--rule-name` for the `npx voxengine-ci upload` command when you modify an existing application and rules.

---

## CI/CD templates

### GitLab

Include a template in your CI/CD job:

```yml
  include:
  - remote: 'https://github.com/voximplant/voxengine-ci/ci-cd-templates/.gitlab.yml'
```

Define env variables:

- `VOX_CI_CREDENTIALS` – path to your `json` credentials file (`vox_ci_credentials.json` by default)
- `VOX_CI_CREDENTIALS_CONTENT` – `vox_ci_credentials.json` file contents in the `json` format

Use the `extends` keyword to reuse the `.voxengine-ci` configuration sections from the template:

```yml
your-job:
  extends:
    - .voxengine-ci
  script:
    - your-script-part-one
    - your-script-part-two
    - etc.
```

You can customize your script using the following example:

```yml
your-job:
  extends:
    - .voxengine-ci
  variables:
    VOX_CI_CREDENTIALS: $SECRET_FILE_PATH
    VOX_CI_CREDENTIALS_CONTENT: $SECRET_FILE_CONTENT
  dependencies:
    - build
  when: manual
  only:
    - master
  tags:
    - docker
  script:
    - npx voxengine-ci upload --applicaiton-id 123456
    - npx voxengine-ci upload --application-name my_first_application
    - npx voxengine-ci upload --application-name my_first_application --rule-name my_second_rule --dry-run
```

### GitHub

Copy the `https://github.com/voximplant/voxengine-ci/ci-cd-templates/.github.yml` YAML file contents to your repository at `.github/workflows/any_file_name.yml`.

Define the GitHub Actions secrets in the `settings/secrets/actions` section of your GitHub project:

- `VOX_CI_CREDENTIALS` – path to your `json` credentials file (`vox_ci_credentials.json` by default)
- `VOX_CI_CREDENTIALS_CONTENT` - `vox_ci_credentials.json` file contents in the `json` format

You can customize your script using the following example:

```yml
name: voxengine-ci

on: workflow_dispatch

jobs:
  your-job:
    runs-on: ununtu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          check-latest: true
      - name: Install voxengine-ci
        run: npm ci
      - name: Prepare credentials
        run: echo "${{ env.VOX_CI_CREDENTIALS_CONTENT }}" > ${{ env.$VOX_CI_CREDENTIALS }}
        env:
          VOX_CI_CREDENTIALS: ${{ secrets.SECRET_FILE_PATH }}
          VOX_CI_CREDENTIALS_CONTENT: ${{ secrets.SECRET_FILE_CONTENT }}
      - name: Run voxengine-ci scripts
        run: |
          npx voxengine-ci upload --applicaiton-id 123456
          npx voxengine-ci upload --application-name my_first_application
          npx voxengine-ci upload --application-name my_first_application --rule-name my_second_rule --dry-run
```

## Instruments

[node.js](https://nodejs.org/en/)  
[typescript](https://www.typescriptlang.org/)  
[dotenv](https://www.npmjs.com/package/dotenv)  
[@voximplant/apiclient-nodejs](https://www.npmjs.com/package/@voximplant/apiclient-nodejs)
