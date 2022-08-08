import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import { ApplicationModule } from '../../lib/modules/application.module';
import { existsSync } from 'fs';
const path = require('path');

describe('yarn voxengine-ci init --force', () => {
  before(async () => {
    const application = new ApplicationModule();
    await application.init();
    await application.projectCleanup();
    await application.projectInit();
  });
  it('should create application directory', async () => {
    const applicationDirectoryPath = path.resolve('voxfiles/applications');
    const existApplicationDirectory = existsSync(applicationDirectoryPath);
    expect(existApplicationDirectory).to.equal(true);
  });
  it('should create application metadata directory', async () => {
    const pathTo = path.resolve('voxfiles/.voxengine-ci/applications');
    const existApplicationMetadataDirectory = existsSync(pathTo);
    expect(existApplicationMetadataDirectory).to.equal(true);
  });
});
