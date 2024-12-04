import { join } from 'node:path';

import { FileSystemContext } from '../contexts/file-system.context';
import { VoxRulesList, VoxRulesMetadataList } from '../types/vox-rule.type';
import { AbstractPersistentRepository } from './abstract.persistent.repository';

export class VoxRulePersistentRepository extends AbstractPersistentRepository {
  relativeStoragePath = 'applications';

  basename = 'rules.config';
  metadataBasename = 'rules.metadata.config';

  constructor(context: FileSystemContext) {
    super(context);
  }

  create = async (
    voxRulesList: VoxRulesList,
    applicationName: string,
  ): Promise<void> => {
    try {
      const joinedPath = join(this.relativeStoragePath, applicationName);
      await this.context.client.createFile(
        joinedPath,
        this.basename,
        JSON.stringify(voxRulesList),
      );
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__CREATE_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  createMetadata = async (
    voxRulesMetadataList: VoxRulesMetadataList,
    applicationName: string,
  ): Promise<void> => {
    try {
      const joinedPath = join(this.relativeStoragePath, applicationName);
      await this.context.client.createMetadataFile(
        joinedPath,
        this.metadataBasename,
        JSON.stringify(voxRulesMetadataList),
      );
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__CREATE_METADATA_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  createOrUpdate = async (
    voxRulesList: VoxRulesList,
    applicationName: string,
  ): Promise<void> => {
    try {
      const joinedPath = join(this.relativeStoragePath, applicationName);
      await this.context.client.createOrUpdateFile(
        joinedPath,
        this.basename,
        JSON.stringify(voxRulesList),
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
    voxRulesMetadataList: VoxRulesMetadataList,
    applicationName: string,
  ): Promise<void> => {
    try {
      const joinedPath = join(this.relativeStoragePath, applicationName);
      await this.context.client.createOrUpdateMetadataFile(
        joinedPath,
        this.metadataBasename,
        JSON.stringify(voxRulesMetadataList),
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

  read = async (applicationName: string): Promise<VoxRulesList> => {
    try {
      const joinedPath = join(
        this.relativeStoragePath,
        applicationName,
        this.basename,
      );
      const rawData = await this.context.client.readFile(joinedPath);
      if (!rawData) return;
      // TODO: Need to refactor this part
      try {
        return <VoxRulesList>JSON.parse(rawData);
      } catch (error) {
        throw new Error(
          this.lmg.generate(
            'ERR__APP_DATA_FORMAT_IS_NOT_VALID',
            applicationName,
          ),
        );
      }
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__READ_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  readMetadata = async (
    applicationName: string,
  ): Promise<VoxRulesMetadataList> => {
    try {
      const joinedPath = join(
        this.relativeStoragePath,
        applicationName,
        this.metadataBasename,
      );
      const rawData = await this.context.client.readMetadataFile(joinedPath);
      if (!rawData) {
        throw new Error(
          this.lmg.generate('ERR__APP_BY_NAME_DOES_NOT_EXIST', applicationName),
        );
      }
      // TODO: Need to refactor this part
      try {
        return <VoxRulesMetadataList>JSON.parse(rawData);
      } catch (error) {
        throw new Error(
          this.lmg.generate(
            'ERR__APP_METADATA_FORMAT_IS_NOT_VALID',
            applicationName,
          ),
        );
      }
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__READ_METADATA_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };
}
