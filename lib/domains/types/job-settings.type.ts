export type ApplicationBuildJobSettings = {
  applicationName: string;
  applicationId: number;
};

export type ApplicationBuildAndUploadJobSettings = {
  applicationName: string;
  applicationId: number;
  isForce: boolean;
};

export type ApplicationByRuleBuildJobSettings = {
  applicationName: string;
  applicationId: number;
  ruleName: string;
  ruleId: number;
};

export type ApplicationByRuleBuildAndUploadJobSettings = {
  applicationName: string;
  applicationId: number;
  ruleName: string;
  ruleId: number;
  isForce: boolean;
};
