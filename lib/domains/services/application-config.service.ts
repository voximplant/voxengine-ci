import { config } from 'dotenv';

config();

import { ApplicationConfig } from '../types/application-config.type';

export class ApplicationConfigService {
  getConfig = (): ApplicationConfig => ({
    voximplant: {
      CREDENTIALS: process.env.VOX_CI_CREDENTIALS || 'vox_ci_credentials.json',
    },
    voxengine_ci: {
      ROOT_DIRECTORY: process.env.VOX_CI_ROOT_PATH || 'voxfiles',
    },
  });
}
