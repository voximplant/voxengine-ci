import { expect } from 'chai';
import { describe } from 'mocha';
import { stub, assert } from 'sinon';

import { FileSystemContext } from '../../../../lib/domains/contexts/file-system.context';
import { VoxScenarioPersistentRepository } from '../../../../lib/domains/repositories/vox-scenario.persistent.repository';

describe('VoxScenarioPersistentRepository', () => {
  const fileSystemContext = new FileSystemContext('', '');
  const applicationName = 'app.example.voximplant.com';
  const voxScenarioPersistentRepository = new VoxScenarioPersistentRepository(
    fileSystemContext,
    applicationName,
  );

  describe('paths', () => {
    it('stores scenarios under the application directory', () => {
      expect(voxScenarioPersistentRepository.relativeStoragePath).to.equal(
        `applications/${applicationName}/scenarios`,
      );
    });
  });

  describe('create', () => {
    let createFileStub: any;
    beforeEach(function () {
      createFileStub = stub(fileSystemContext.client, 'createFile');
    });
    it('should write the scenario into the application src directory', async () => {
      await voxScenarioPersistentRepository.create({
        scenarioName: 'incoming',
        scenarioScript: 'const x = 1;',
      });
      createFileStub.restore();
      assert.calledWith(
        createFileStub,
        `applications/${applicationName}/scenarios/src`,
        'incoming.voxengine',
        'const x = 1;',
        'js',
      );
    });
  });

  describe('createOrUpdateTsConfig', () => {
    it('includes voxengine typings relative to the voxfiles root', async () => {
      const resolvePathStub = stub(
        fileSystemContext.client,
        'resolvePath',
      ).callsFake((relativePath: string) => `/resolved/${relativePath}`);
      const checkExistsStub = stub(
        fileSystemContext.client,
        'checkExists',
      ).returns(true);
      const createOrUpdateFileStub = stub(
        fileSystemContext.client,
        'createOrUpdateFile',
      );

      await voxScenarioPersistentRepository.createOrUpdateTsConfig([
        'incoming',
      ]);

      const tsConfig = JSON.parse(
        createOrUpdateFileStub.firstCall.args[2] as string,
      );
      expect(tsConfig.include).to.include(
        '/resolved/../typings/voxengine.d.ts',
      );
      expect(tsConfig.include).to.include(
        '/resolved/../node_modules/@voximplant/voxengine-ci/typings/voxengine.d.ts',
      );
      expect(tsConfig.include).to.not.include(
        '/resolved/../../../typings/voxengine.d.ts',
      );

      resolvePathStub.restore();
      checkExistsStub.restore();
      createOrUpdateFileStub.restore();
    });
  });
});
