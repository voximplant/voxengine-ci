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

- VOX_CI_CREDENTIALS - path to your `JSON` credentials file (`vox_ci_credentials.json` by default)
- VOX_CI_ROOT_PATH - path to the directory where the `vox` files will be located (`voxfiles` by default)

Creating a .env file is not necessary if you move the file with credentials to your project folder, and it has a default name – `vox_ci_credentials.json`. 
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

### Build application scenarios (by specifying _application-name_) for ALL application rules without uploading to the platform

```shell
  npx voxengine-ci upload --application-name your_application_name --dry-run
```

### Build application scenarios (by specifying _rule-name_) for a specified application rule without uploading to the platform

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
    - remote: 'https://raw.githubusercontent.com/voximplant/voxengine-ci/main/ci-cd-templates/.gitlab.yml'
```

Define env variables:

- `VOX_CI_CREDENTIALS` – path to your `JSON` credentials file (`vox_ci_credentials.json` by default)
- `VOX_CI_CREDENTIALS_CONTENT` – `vox_ci_credentials.json` file contents in the `JSON` format

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
    - npx voxengine-ci upload --application-id 123456
    - npx voxengine-ci upload --application-name my_first_application
    - npx voxengine-ci upload --application-name my_first_application --rule-name my_second_rule --dry-run
```

### GitHub

Copy the `https://github.com/voximplant/voxengine-ci/blob/main/ci-cd-templates/.github.yml` YAML file contents to your repository at `.github/workflows/any_file_name.yml`.

Define the _GitHub Actions secrets_ in the `settings/secrets/actions` section of your GitHub project:

- `VOX_CI_CREDENTIALS` – path to your `JSON` credentials file (`vox_ci_credentials.json` by default)
- `VOX_CI_CREDENTIALS_CONTENT` - `vox_ci_credentials.json` file contents in the `base64` format

> __NOTE:__ since GitHub has restrictions on passing _Actions secrets_ in the `JSON` format, you need to __base64-encode__ the value before assigning it to the `VOX_CI_CREDENTIALS_CONTENT` variable

You can customize your script using the following example:

```yml
name: voxengine-ci

on: workflow_dispatch

jobs:
  your-job:
    runs-on: ubuntu-latest
    needs: [ build ]
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
        run: echo "${{ env.VOX_CI_CREDENTIALS_CONTENT }}" | base64 --decode > ${{ env.VOX_CI_CREDENTIALS }}
        env:
          VOX_CI_CREDENTIALS: ${{ secrets.SECRET_FILE_PATH }}
          VOX_CI_CREDENTIALS_CONTENT: ${{ secrets.SECRET_FILE_CONTENT }}
      - name: Run voxengine-ci scripts
        run: |
          npx voxengine-ci upload --application-id 123456
          npx voxengine-ci upload --application-name my_first_application
          npx voxengine-ci upload --application-name my_first_application --rule-name my_second_rule --dry-run
```

### Jenkins

First, install all necessary plugins:

- NodeJS plugin. After the plugin has been installed, click __Add NodeJS__ in the __NodeJS installations__ section (in Global Tool Configuration) and specify a name (e.g. "nodejsinstallation" - this name will be used in the __Build environment__ section).

- Git plugin

- Credentials Binding plugin

- Pipeline plugin (for using Jenkinsfile)

#### Creating a job using the "Freestyle project" Item

Create a new Item and select __Freestyle project__.

In __Source code management__, choose the __Git__ option and specify the repository URL and credentials. If there are no SSH credentials in Jenkins yet, generate them and add a private key of the __SSH Username with private key__ type (choose the __Enter directly__ option in the __Private key__ section), and add a public key in your git account (__SSH keys__ section).

In __Build environment__, choose the __Use secret text(s) or file(s)__ option, specify the "VOX_CI_CREDENTIALS" name for the corresponding variable and add the "vox_ci_credentials.json" file of the __Secret file__ type with credentials of your vox account.

Check __Provide Node & npm bin/ folder to PATH__ in the __Build environment__ section and specify the name of the NodeJS installation ("nodejsinstallation" in our example).

In the __Build__ section, select __Execute shell__ in the __Build step__ dropdown list and add the following script:

```shell
npm ci
npx voxengine-ci upload --application-name my-application
```

The job is ready to run.

#### Using Jenkinsfile

In your project repository, add Jenkinsfile:

```shell
pipeline {
    agent any
    tools {nodejs "nodejsinstallation"} // name of your NodeJS installation
    stages {
        stage('Before-publish') {
            steps {
                sh "npm ci"
            }
        }
        stage('Publish') {
            steps {
                sh "npx voxengine-ci upload --application-name test" // your voxengine-ci script
            }
        }
    }
}
```

Create the __Pipeline__ Item.

Select __Pipeline script from SCM__ in the __Pipeline__ section.

Select __Git__ from the __SCM__ dropdown list, set your repository URL using SSH, and choose credentials. If you do not have credentials yet, click __Add__ and select the __SSH Username with private key__ type. Then add a private key (in the __Private key__ section, choose __Enter directly__) and a public key in your git account (__SSH keys__).

Specify __Jenkinsfile__ in __Script Path__.

Pipeline is ready!

## Instruments

[node.js](https://nodejs.org/en/)  
[typescript](https://www.typescriptlang.org/)  
[dotenv](https://www.npmjs.com/package/dotenv)  
[@voximplant/apiclient-nodejs](https://www.npmjs.com/package/@voximplant/apiclient-nodejs)
