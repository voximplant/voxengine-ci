import { APIErrorCode } from '@voximplant/apiclient-nodejs/dist/Enums';
import { ApplicationInfo } from '@voximplant/apiclient-nodejs/dist/Structures';

import { VoximplantContext } from '../contexts/voximplant.context';
import { isApiErrorResponse } from '../types/api-error-response.type';
import { AddApplicationResponse } from '@voximplant/apiclient-nodejs/dist/Interfaces';
import { LogMessageGeneratorFactory } from '../../utils/logMessageGenerator';

export class VoxApplicationPlatformRepository {
  private lmg = LogMessageGeneratorFactory.getInstance();

  constructor(public context: VoximplantContext) {}

  init = () => {
    console.info(
      this.lmg.generate('INFO__INIT_SUCCESS', this.constructor.name),
    );
  };

  downloadApplications = async (): Promise<ApplicationInfo[]> => {
    const response = await this.context.client.Applications.getApplications({});
    if (isApiErrorResponse(response)) {
      throw new Error(
        this.lmg.generate(
          'ERR__VOXIMPLANT_API_ERROR',
          APIErrorCode[response.error.code],
        ),
      );
    }
    if (response.totalCount === 0) return [];
    const { result } = await this.context.client.Applications.getApplications({
      withRules: true,
      count: response.totalCount,
    });
    console.info(this.lmg.generate('INFO__APPLICATIONS_DOWNLOADED'));
    return result;
  };

  getAccountName = async (): Promise<string> => {
    const response = await this.context.client.Accounts.getAccountInfo({});
    if (isApiErrorResponse(response)) {
      throw new Error(
        this.lmg.generate(
          'ERR__VOXIMPLANT_API_ERROR',
          APIErrorCode[response.error.code],
        ),
      );
    }
    return response.result.accountName;
  };

  addApplication = async (applicationName: string): Promise<number> => {
    const response: AddApplicationResponse =
      await this.context.client.Applications.addApplication({
        applicationName,
      });
    if (isApiErrorResponse(response)) {
      throw new Error(
        this.lmg.generate(
          'ERR__VOXIMPLANT_API_ERROR',
          APIErrorCode[response.error.code],
        ),
      );
    }
    const { applicationId } = response;
    console.info(
      this.lmg.generate(
        'INFO__APPLICATION_UPLOADED',
        applicationId.toString(),
        applicationName,
      ),
    );
    return applicationId;
  };
}
