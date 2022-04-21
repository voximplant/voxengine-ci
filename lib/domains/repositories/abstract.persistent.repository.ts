import { join } from 'path';

import { FileSystemContext } from '../contexts/filesystem.context';
import { LogMessageGeneratorFactory } from '../../utils/logMessageGenerator';

export abstract class AbstractPersistentRepository {
  relativeStoragePath: string;

  basename: string;
  metadataBasename: string;

  lmg = LogMessageGeneratorFactory.getInstance();

  protected constructor(public context: FileSystemContext) {}

  init = async (): Promise<void> => {
    await this.context.client.createDirectory(this.relativeStoragePath);
    await this.context.client.createMetadataDirectory(this.relativeStoragePath);
    console.info(
      this.lmg.generate('INFO__INIT_SUCCESS', this.constructor.name),
    );
  };

  link = async (): Promise<void> => {
    await this.context.client.createDirectory(this.relativeStoragePath);
  };

  linkMetadata = async (): Promise<void> => {
    await this.context.client.createMetadataDirectory(this.relativeStoragePath);
  };

  unlink = async (): Promise<void> => {
    await this.context.client.removeDirectory(this.relativeStoragePath);
  };

  unlinkMetadata = async (): Promise<void> => {
    await this.context.client.removeMetadataDirectory(this.relativeStoragePath);
  };

  checkStorageExists = (path = '.'): boolean => {
    const joinedPath = join(this.relativeStoragePath, path);
    return this.context.client.checkExists(joinedPath);
  };

  createStorage = async (path: string): Promise<void> => {
    const joinedPath = join(this.relativeStoragePath, path);
    await this.context.client.createDirectory(joinedPath);
  };

  createMetadataStorage = async (path: string): Promise<void> => {
    const joinedPath = join(this.relativeStoragePath, path);
    await this.context.client.createMetadataDirectory(joinedPath);
  };

  readStorage = async (path = '.'): Promise<string[]> => {
    const joinedPath = join(this.relativeStoragePath, path);
    return await this.context.client.readDirectory(joinedPath);
  };

  readMetadataStorage = async (path = '.'): Promise<string[]> => {
    const joinedPath = join(this.relativeStoragePath, path);
    return await this.context.client.readMetadataDirectory(joinedPath);
  };

  removeStorage = async (path: string): Promise<void> => {
    const joinedPath = join(this.relativeStoragePath, path);
    await this.context.client.removeDirectory(joinedPath);
  };

  removeMetadataStorage = async (path: string): Promise<void> => {
    const joinedPath = join(this.relativeStoragePath, path);
    await this.context.client.removeMetadataDirectory(joinedPath);
  };

  remove = async (path: string): Promise<void> => {
    const joinedPath = join(this.relativeStoragePath, path);
    await this.context.client.removeFile(joinedPath);
  };

  removeMetadata = async (path: string): Promise<void> => {
    const joinedPath = join(this.relativeStoragePath, path);
    await this.context.client.removeMetadataFile(joinedPath);
  };
}
