import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';

import { ApplicationConfigService } from '../../../../lib/domains/services/application-config.service';

describe('ApplicationConfigService', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.VOX_CI_HOST;
    delete process.env.VOX_CI_CREDENTIALS;
    delete process.env.VOX_CI_ROOT_PATH;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getConfig', () => {
    it('should expose HOST from VOX_CI_HOST', () => {
      process.env.VOX_CI_HOST = 'custom.api.example';

      const config = new ApplicationConfigService().getConfig();

      expect(config.voximplant.HOST).to.equal('custom.api.example');
    });

    it('should leave HOST undefined when VOX_CI_HOST is not set', () => {
      const config = new ApplicationConfigService().getConfig();

      expect(config.voximplant.HOST).to.be.undefined;
    });

    it('should leave HOST undefined when VOX_CI_HOST is empty', () => {
      process.env.VOX_CI_HOST = '';

      const config = new ApplicationConfigService().getConfig();

      expect(config.voximplant.HOST).to.be.empty;
    });

    it('should keep default CREDENTIALS path when VOX_CI_CREDENTIALS is not set', () => {
      const config = new ApplicationConfigService().getConfig();

      expect(config.voximplant.CREDENTIALS).to.equal(
        'vox_ci_credentials.json',
      );
    });
  });
});
