import { join } from 'node:path';

import {
  VoxApplication,
  VoxApplicationMetadata,
} from '../entities/vox-application.entity';
import { FileSystemContext } from '../contexts/file-system.context';
import { ApplicationInfo } from '@voximplant/apiclient-nodejs/dist/Structures';
import { AbstractPersistentRepository } from './abstract.persistent.repository';

export class VoxApplicationPersistentRepository extends AbstractPersistentRepository {
  relativeStoragePath = 'applications';

  basename = 'application.config';
  metadataBasename = 'application.metadata.config';

  constructor(context: FileSystemContext) {
    super(context);
  }

  create = async (voxApplication: VoxApplication): Promise<void> => {
    try {
      const joinedPath = join(
        this.relativeStoragePath,
        voxApplication.applicationName,
      );
      await this.context.client.createFile(
        joinedPath,
        this.basename,
        JSON.stringify(voxApplication),
      );
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__CREATE_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  createMetadata = async (
    voxApplicationMetadata: VoxApplicationMetadata,
  ): Promise<void> => {
    try {
      const joinedPath = join(
        this.relativeStoragePath,
        voxApplicationMetadata.applicationName,
      );
      await this.context.client.createMetadataFile(
        joinedPath,
        this.metadataBasename,
        JSON.stringify(voxApplicationMetadata),
      );
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__CREATE_METADATA_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  createOrUpdate = async (voxApplication: VoxApplication): Promise<void> => {
    try {
      const joinedPath = join(
        this.relativeStoragePath,
        voxApplication.applicationName,
      );
      await this.context.client.createOrUpdateFile(
        joinedPath,
        this.basename,
        JSON.stringify(voxApplication),
      );
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__CREATE_OR_UPDATE_FAILED',
          this.constructor.name,
        ),
      );
      console.error(error);
    }
  };

  createOrUpdateMetadata = async (
    voxApplicationMetadata: VoxApplicationMetadata,
  ): Promise<void> => {
    try {
      const joinedPath = join(
        this.relativeStoragePath,
        voxApplicationMetadata.applicationName,
      );
      await this.context.client.createOrUpdateFile(
        joinedPath,
        this.metadataBasename,
        JSON.stringify(voxApplicationMetadata),
      );
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__CREATE_OR_UPDATE_METADATA_FAILED',
          this.constructor.name,
        ),
      );
      console.error(error);
    }
  };

  read = async (applicationName: string): Promise<VoxApplication> => {
    try {
      const joinedPath = join(
        this.relativeStoragePath,
        applicationName,
        this.basename,
      );
      const rawData = await this.context.client.readFile(joinedPath);
      if (!rawData) return;
      const rawApplication: ApplicationInfo = <ApplicationInfo>(
        JSON.parse(rawData)
      );
      return new VoxApplication(rawApplication);
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__READ_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  readMetadata = async (
    applicationName: string,
  ): Promise<VoxApplicationMetadata> => {
    try {
      const joinedPath = join(
        this.relativeStoragePath,
        applicationName,
        this.metadataBasename,
      );
      const rawData = await this.context.client.readMetadataFile(joinedPath);
      if (!rawData) return;
      const rawApplicationMetadata: ApplicationInfo = <ApplicationInfo>(
        JSON.parse(rawData)
      );
      return new VoxApplicationMetadata(rawApplicationMetadata);
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__READ_METADATA_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };
}
