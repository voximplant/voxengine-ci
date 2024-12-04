import { expect } from 'chai';
import { describe } from 'mocha';
import { stub, assert } from 'sinon';

import { FileSystemContext } from '../../../../lib/domains/contexts/file-system.context';
import { VoxApplicationPersistentRepository } from '../../../../lib/domains/repositories/vox-application.persistent.repository';

describe('VoxApplicationPersistentRepository', () => {
  const fileSystemContext = new FileSystemContext('', '');
  const voxApplicationPersistentRepository =
    new VoxApplicationPersistentRepository(fileSystemContext);
  describe('create', () => {
    let createFileStub: any;
    beforeEach(function () {
      createFileStub = stub(fileSystemContext.client, 'createFile');
    });
    it('should call createFile with arguments', async () => {
      await voxApplicationPersistentRepository.create({
        applicationName: 'application',
      });
      createFileStub.restore();
      assert.calledWith(
        createFileStub,
        'applications/application',
        'application.config',
        JSON.stringify({ applicationName: 'application' }),
      );
    });
  });

  describe('createMetadata', () => {
    let createMetadataFileStub: any;
    beforeEach(function () {
      createMetadataFileStub = stub(
        fileSystemContext.client,
        'createMetadataFile',
      );
    });
    it('should call createMetadataFile with arguments', async () => {
      await voxApplicationPersistentRepository.createMetadata({
        applicationName: 'application',
        applicationId: 11,
      });
      createMetadataFileStub.restore();
      assert.calledWith(
        createMetadataFileStub,
        'applications/application',
        'application.metadata.config',
        JSON.stringify({
          applicationName: 'application',
          applicationId: 11,
        }),
      );
    });
  });

  describe('read', () => {
    let readFileStub: any;
    beforeEach(function () {
      readFileStub = stub(fileSystemContext.client, 'readFile');
    });
    it('should return new VoxApplication', async () => {
      const rawData = '{"applicationName":"raw.nikit.voximplant.com"}';
      readFileStub.returns(Promise.resolve(rawData));
      const result = await voxApplicationPersistentRepository.read('');
      readFileStub.restore();
      expect(result).to.deep.equal({
        applicationName: 'raw.nikit.voximplant.com',
      });
    });
  });

  describe('readMetadata', () => {
    let readMetadataFileStub: any;
    beforeEach(function () {
      readMetadataFileStub = stub(fileSystemContext.client, 'readMetadataFile');
    });
    it('should return new VoxApplicationMetadata', async () => {
      const rawData =
        '{"applicationId":11, "applicationName":"raw.nikit.voximplant.com"}';
      readMetadataFileStub.returns(Promise.resolve(rawData));
      const result = await voxApplicationPersistentRepository.readMetadata('');
      readMetadataFileStub.restore();
      expect(result).to.deep.equal({
        applicationId: 11,
        applicationName: 'raw.nikit.voximplant.com',
      });
    });
  });
});
