import { ApplicationInfo } from '@voximplant/apiclient-nodejs/dist/Structures';

export class VoxApplication {
  applicationName: string;

  constructor(applicationInfo: ApplicationInfo) {
    this.applicationName = applicationInfo.applicationName;
  }
}

export class VoxApplicationMetadata {
  applicationId: number;
  applicationName: string;

  constructor(applicationInfo: ApplicationInfo) {
    this.applicationId = applicationInfo.applicationId;
    this.applicationName = applicationInfo.applicationName;
  }
}
