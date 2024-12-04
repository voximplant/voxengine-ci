import {
  VoxApplication,
  VoxApplicationMetadata,
} from '../entities/vox-application.entity';
import { FullVoxApplicationInfo } from '../types/vox-application.type';
import { LogMessageGeneratorFactory } from '../../utils/log-message-generator';
import { ApplicationByRuleBuildAndUploadJobSettings } from '../types/job-settings.type';
import { VoxApplicationPersistentRepository } from '../repositories/vox-application.persistent.repository';
import { VoxApplicationPlatformRepository } from '../repositories/vox-application.platform.repository';

export class VoxApplicationService {
  private lmg: LogMessageGeneratorFactory =
    LogMessageGeneratorFactory.getInstance();

  constructor(
    private platformRepository: VoxApplicationPlatformRepository,
    private persistentRepository: VoxApplicationPersistentRepository,
  ) {}

  init = () => {
    console.info(
      this.lmg.generate('INFO__INIT_SUCCESS', this.constructor.name),
    );
  };

  cleanup = async (): Promise<void> => {
    await this.persistentRepository.unlink();
    await this.persistentRepository.link();
    await this.persistentRepository.unlinkMetadata();
    await this.persistentRepository.linkMetadata();
  };

  checkApplicationsAlreadyExists = async (): Promise<boolean> => {
    try {
      const applications = await this.persistentRepository.readStorage();
      return !!applications?.length;
    } catch (error) {
      console.error(error);
    }
  };

  downloadApplications = async (): Promise<FullVoxApplicationInfo[]> => {
    return await this.platformRepository.downloadApplications();
  };

  saveApplication = async (rawApplication: FullVoxApplicationInfo) => {
    try {
      const voxApplication: VoxApplication = new VoxApplication(rawApplication);
      await this.persistentRepository.createStorage(
        voxApplication.applicationName,
      );
      await this.persistentRepository.create(voxApplication);
    } catch (error) {
      console.error(error);
    }
  };

  saveApplicationMetadata = async (rawApplication: FullVoxApplicationInfo) => {
    try {
      const voxApplicationMetadata: VoxApplicationMetadata =
        new VoxApplicationMetadata(rawApplication);
      await this.persistentRepository.createMetadataStorage(
        voxApplicationMetadata.applicationName,
      );
      await this.persistentRepository.createMetadata(voxApplicationMetadata);
    } catch (error) {
      console.error(error);
    }
  };

  readApplicationMetadataStorage = async () => {
    return await this.persistentRepository.readMetadataStorage();
  };

  readApplicationMetadata = async (applicationName: string) => {
    return await this.persistentRepository.readMetadata(applicationName);
  };

  getApplicationNameAndId = async (
    settings: Partial<ApplicationByRuleBuildAndUploadJobSettings>,
  ): Promise<Partial<ApplicationByRuleBuildAndUploadJobSettings>> => {
    const { applicationId } = settings;
    const applicationName = await this.getApplicationFullName(
      settings.applicationName,
    );
    const applications = await this.platformRepository.downloadApplications();
    for (const application of applications) {
      if (application?.applicationId === applicationId) {
        return {
          applicationName: application.applicationName,
          applicationId,
        };
      }
      if (!applicationId && application?.applicationName === applicationName) {
        return {
          applicationName,
          applicationId: application.applicationId,
        };
      }
    }
    if (applicationId) {
      // NOTE: the case when the 'applicationId' is specified but not found on the platform
      throw new Error(
        this.lmg.generate(
          'ERR__APP_BY_ID_DOES_NOT_EXIST',
          applicationId.toString(),
        ),
      );
    }
    return { applicationName, applicationId };
  };

  getApplicationFullName = async (applicationName: string): Promise<string> => {
    if (!applicationName) return;
    const isFullApplicationName = applicationName.split('.').length > 1;
    if (isFullApplicationName) return applicationName;
    const accountName = await this.platformRepository.getAccountName();
    if (!accountName) {
      throw new Error(
        this.lmg.generate('ERR__APP_BY_NAME_DOES_NOT_EXIST', applicationName),
      );
    }
    return `${applicationName}.${accountName}.voximplant.com`;
  };

  addApplication = async (applicationName: string): Promise<number> => {
    const applicationData: VoxApplication =
      await this.persistentRepository.read(applicationName);
    if (!applicationData) {
      throw new Error(
        this.lmg.generate(
          'ERR__APP_BY_NAME_ON_CREATE_DOES_NOT_EXIST',
          applicationName,
        ),
      );
    }
    if (applicationData.applicationName !== applicationName) {
      throw new Error(
        this.lmg.generate(
          'ERR__APP_NAME_IN_APP_CONFIG_IS_DIFFERENT',
          applicationData.applicationName,
          applicationName,
        ),
      );
    }
    return await this.platformRepository.addApplication(applicationName);
  };
}
