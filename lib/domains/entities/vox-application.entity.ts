import { ApplicationInfo } from '@voximplant/apiclient-nodejs/dist/Structures';
import { VoxApplicationMetadataScenario } from '../types/vox-application.type';

export class VoxApplication {
  applicationName: string;

  constructor(applicationInfo: ApplicationInfo) {
    this.applicationName = applicationInfo.applicationName;
  }
}

export class VoxApplicationMetadata {
  applicationId: number;
  applicationName: string;
  scenarios: VoxApplicationMetadataScenario[];

  constructor(
    applicationInfo: ApplicationInfo,
    scenarios: VoxApplicationMetadataScenario[],
  ) {
    this.applicationId = applicationInfo.applicationId;
    this.applicationName = applicationInfo.applicationName;
    this.scenarios = scenarios;
  }
}
