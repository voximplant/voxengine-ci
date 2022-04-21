import { existsSync } from 'fs';
import { extname, join, resolve } from 'path';
import { mkdir, readdir, readFile, rm, writeFile } from 'fs/promises';

import { parse as parseYAML } from 'yaml';
import { parse as parseTOML } from '@iarna/toml';

import { LogMessageGeneratorFactory } from '../../utils/logMessageGenerator';

export class FileSystemContext {
  private readonly rootDirectoryPath: string;
  private readonly rootMetadataDirectoryPath: string;

  private readonly availableExtensions: string[];
  private readonly availableMetadataExtensions: string[];

  private lmg = LogMessageGeneratorFactory.getInstance();

  constructor(rootDirectoryName: string, rootMetadataDirectoryName: string) {
    this.rootDirectoryPath = resolve(rootDirectoryName);
    this.rootMetadataDirectoryPath = resolve(
      this.rootDirectoryPath,
      rootMetadataDirectoryName,
    );

    this.availableExtensions = ['json', 'yml', 'yaml', 'toml', 'ts', 'js'];
    this.availableMetadataExtensions = ['json'];
  }

  init = async (): Promise<void> => {
    if (!existsSync(this.rootDirectoryPath)) {
      await mkdir(this.rootDirectoryPath);
      console.info(
        this.lmg.generate(
          'INFO__ROOT_DIRECTORY_IS_CREATED',
          this.rootDirectoryPath,
        ),
      );
    }
    if (!existsSync(this.rootMetadataDirectoryPath)) {
      await mkdir(this.rootMetadataDirectoryPath);
      console.info(
        this.lmg.generate(
          'INFO__ROOT_DIRECTORY_METADATA_IS_CREATED',
          this.rootMetadataDirectoryPath,
        ),
      );
    }
    console.info(
      this.lmg.generate('INFO__INIT_SUCCESS', this.constructor.name),
    );
  };

  /**
   * TODO: This is looks like responsibility levels error.
   *  Data transformation can be used on any layers, where we need to transform data from one to another.
   *  So IMHO we need to move the data transformation logic from this method to the something like `helpers` or etc.
   */
  private transformData = (data: string, format: string): string => {
    const preparedFormat = format.toLowerCase();
    const availableFormats = this.availableExtensions;

    if (!availableFormats.includes(preparedFormat)) {
      throw new Error(
        this.lmg.generate(
          'ERR__UNKNOWN_FORMAT',
          format,
          availableFormats.toString(),
        ),
      );
    }

    if (preparedFormat === 'yaml' || preparedFormat === 'yml') {
      try {
        console.info(this.lmg.generate('INFO__TRANSFORM_YML_DATA'));
        return JSON.stringify(parseYAML(data));
      } catch (error) {
        console.error(this.lmg.generate('ERR__CANNOT_TRANSFORM_YML'));
        throw error;
      }
    }

    if (preparedFormat === 'toml') {
      try {
        console.info(this.lmg.generate('INFO__TRANSFORM_TOML_DATA'));
        return JSON.stringify(parseTOML(data)['rules']);
      } catch (error) {
        console.error(this.lmg.generate('ERR__CANNOT_TRANSFORM_TOML'));
        throw error;
      }
    }

    return data.toString();
  };

  // TODO: Remove all 'METADATA' methods and refactor remaining to the second arg
  // somethingToDo(data, isMetadata: boolean = false)
  client = {
    resolvePath: (relativePath: string) =>
      resolve(this.rootDirectoryPath, relativePath),

    resolveMetadataPath: (relativePath: string) =>
      resolve(this.rootMetadataDirectoryPath, relativePath),

    checkExists: (relativePath: string): boolean => {
      const resolvedPath = this.client.resolvePath(relativePath);
      try {
        return existsSync(resolvedPath);
      } catch (error) {
        console.error(
          this.lmg.generate('ERR__CHECK_EXISTS_FAILED', this.constructor.name),
        );
        console.error(error);
      }
    },

    checkMetadataExists: (relativePath: string): boolean => {
      const resolvedPath = this.client.resolveMetadataPath(relativePath);
      try {
        return existsSync(resolvedPath);
      } catch (error) {
        console.error(
          this.lmg.generate(
            'ERR__CHECK_METADATA_EXISTS_FAILED',
            this.constructor.name,
          ),
        );
        console.error(error);
      }
    },

    createDirectory: async (relativePath: string): Promise<void> => {
      const resolvedPath = this.client.resolvePath(relativePath);
      try {
        if (!existsSync(resolvedPath)) {
          await mkdir(resolvedPath);
          console.info(
            this.lmg.generate('INFO__DIRECTORY_IS_CREATED', resolvedPath),
          );
        }
      } catch (error) {
        console.error(
          this.lmg.generate(
            'ERR__CREATE_DIRECTORY_FAILED',
            this.constructor.name,
          ),
        );
        console.error(error);
      }
    },

    createMetadataDirectory: async (relativePath: string): Promise<void> => {
      const resolvedPath = this.client.resolveMetadataPath(relativePath);
      try {
        if (!existsSync(resolvedPath)) {
          await mkdir(resolvedPath);
          console.info(
            this.lmg.generate(
              'INFO__METADATA_DIRECTORY_IS_CREATED',
              resolvedPath,
            ),
          );
        }
      } catch (error) {
        console.error(
          this.lmg.generate(
            'ERR__CREATE_DIRECTORY_FAILED',
            this.constructor.name,
          ),
        );
        console.error(error);
      }
    },

    readDirectory: async (relativePath: string): Promise<string[]> => {
      const resolvedPath = this.client.resolvePath(relativePath);
      try {
        return await readdir(resolvedPath);
      } catch (error) {
        console.error(
          this.lmg.generate(
            'ERR__READ_DIRECTORY_FAILED',
            this.constructor.name,
          ),
        );
        console.error(error);
      }
    },

    readMetadataDirectory: async (relativePath: string): Promise<string[]> => {
      const resolvedPath = this.client.resolveMetadataPath(relativePath);
      return await readdir(resolvedPath);
    },

    removeDirectory: async (relativePath: string): Promise<void> => {
      const resolvedPath = this.client.resolvePath(relativePath);
      try {
        if (existsSync(resolvedPath)) {
          await rm(resolvedPath, {
            recursive: true,
            force: true,
          });
          console.info(
            this.lmg.generate('INFO__DIRECTORY_IS_REMOVED', resolvedPath),
          );
        }
      } catch (error) {
        console.error(
          this.lmg.generate(
            'ERR__REMOVE_DIRECTORY_FAILED',
            this.constructor.name,
          ),
        );
        console.error(error);
      }
    },

    removeMetadataDirectory: async (relativePath: string): Promise<void> => {
      const resolvedPath = this.client.resolveMetadataPath(relativePath);
      try {
        if (existsSync(resolvedPath)) {
          await rm(resolvedPath, {
            recursive: true,
            force: true,
          });
          console.info(
            this.lmg.generate(
              'INFO__METADATA_DIRECTORY_IS_REMOVED',
              resolvedPath,
            ),
          );
        }
      } catch (error) {
        console.error(
          this.lmg.generate(
            'ERR__REMOVE_METADATA_DIRECTORY_FAILED',
            this.constructor.name,
          ),
        );
        console.error(error);
      }
    },

    createFile: async (
      path: string,
      name: string,
      data: string,
      extension = this.availableExtensions[0],
    ): Promise<void> => {
      const joinedPath = join(path, `${name}.${extension}`);
      const resolvedPath = this.client.resolvePath(joinedPath);
      try {
        if (existsSync(resolvedPath)) {
          throw new Error(
            this.lmg.generate('ERR__PATH_FILE_ALREADY_EXISTS', resolvedPath),
          );
        }
        await writeFile(resolvedPath, data);
        console.info(this.lmg.generate('INFO__FILE_IS_CREATED', resolvedPath));
      } catch (error) {
        console.error(
          this.lmg.generate('ERR__CREATE_FILE_FAILED', this.constructor.name),
        );
        console.error(error);
      }
    },

    createMetadataFile: async (
      path: string,
      name: string,
      data: string,
    ): Promise<void> => {
      const extension = this.availableMetadataExtensions[0];
      const joinedPath = join(path, `${name}.${extension}`);
      const resolvedPath = this.client.resolveMetadataPath(joinedPath);
      try {
        if (existsSync(resolvedPath)) {
          throw new Error(
            this.lmg.generate(
              'ERR__PATH_METADATA_FILE_ALREADY_EXISTS',
              resolvedPath,
            ),
          );
        }
        await writeFile(resolvedPath, data);
        console.info(
          this.lmg.generate('INFO__METADATA_FILE_IS_CREATED', resolvedPath),
        );
      } catch (error) {
        console.error(
          this.lmg.generate(
            'ERR__CREATE_METADATA_FILE_FAILED',
            this.constructor.name,
          ),
        );
        console.error(error);
      }
    },

    createOrUpdateFile: async (
      path: string,
      name: string,
      data: string,
      extension = this.availableExtensions[0],
    ): Promise<void> => {
      const joinedPath = join(path, `${name}.${extension}`);
      const resolvedPath = this.client.resolvePath(joinedPath);
      try {
        await writeFile(resolvedPath, data);
        console.info(
          this.lmg.generate('INFO__FILE_IS_CREATED_OR_UPDATED', resolvedPath),
        );
      } catch (error) {
        console.error(
          this.lmg.generate(
            'ERR__CREATE_OR_UPDATE_FILE_FAILED',
            this.constructor.name,
          ),
        );
        console.error(error);
      }
    },

    createOrUpdateMetadataFile: async (
      path: string,
      name: string,
      data: string,
    ): Promise<void> => {
      const extension = this.availableMetadataExtensions[0];
      const joinedPath = join(path, `${name}.${extension}`);
      const resolvedPath = this.client.resolveMetadataPath(joinedPath);
      try {
        await writeFile(resolvedPath, data);
        console.info(
          this.lmg.generate(
            'INFO__METADATA_FILE_IS_CREATED_OR_UPDATED',
            resolvedPath,
          ),
        );
      } catch (error) {
        console.error(
          this.lmg.generate(
            'ERR__CREATE_OR_UPDATE_METADATA_FILE_FAILED',
            this.constructor.name,
          ),
        );
        console.error(error);
      }
    },

    readFile: async (
      relativePath: string,
      availableExtensions = this.availableExtensions,
    ): Promise<string> => {
      try {
        const resolvedFilePathWithoutExtension =
          this.client.resolvePath(relativePath);
        const filePathList = availableExtensions.map(
          (extension) => `${resolvedFilePathWithoutExtension}.${extension}`,
        );
        for (const filePath of filePathList) {
          const isExists = existsSync(filePath);
          if (isExists) {
            const data = (await readFile(filePath)).toString();
            const format = extname(filePath).slice(1);
            return this.transformData(data, format);
          }
        }
        console.error(
          this.lmg.generate(
            'ERR__FILE_DOES_NOT_EXIST',
            resolvedFilePathWithoutExtension,
          ),
        );
      } catch (error) {
        console.error(
          this.lmg.generate('ERR__READ_FILE_FAILED', this.constructor.name),
        );
        console.error(error);
      }
    },

    readMetadataFile: async (path: string): Promise<string> => {
      const extension = this.availableMetadataExtensions[0];
      const resolvedPath = this.client.resolveMetadataPath(
        `${path}.${extension}`,
      );
      try {
        if (!existsSync(resolvedPath)) {
          console.error(
            this.lmg.generate(
              'ERR__METADATA_FILE_DOES_NOT_EXIST',
              resolvedPath,
            ),
          );
          return;
        }
        return (await readFile(resolvedPath)).toString();
      } catch (error) {
        console.error(
          this.lmg.generate(
            'ERR__READ_METADATA_FILE_FAILED',
            this.constructor.name,
          ),
        );
        console.error(error);
      }
    },

    removeFile: async (
      path: string,
      extension = this.availableExtensions[0],
    ): Promise<void> => {
      const resolvedPath = this.client.resolvePath(`${path}.${extension}`);
      try {
        if (existsSync(resolvedPath)) {
          await rm(resolvedPath);
          console.info(
            this.lmg.generate('INFO__FILE_IS_REMOVED', resolvedPath),
          );
        }
      } catch (error) {
        console.error(
          this.lmg.generate('ERR__REMOVE_FILE_FAILED', this.constructor.name),
        );
        console.error(error);
      }
    },

    removeMetadataFile: async (path: string): Promise<void> => {
      const extension = this.availableMetadataExtensions[0];
      const resolvedPath = this.client.resolveMetadataPath(
        `${path}.${extension}`,
      );
      try {
        if (existsSync(resolvedPath)) {
          await rm(resolvedPath);
          console.info(
            this.lmg.generate('INFO__METADATA_FILE_IS_REMOVED', resolvedPath),
          );
        }
      } catch (error) {
        console.error(
          this.lmg.generate(
            'ERR__REMOVE_METADATA_FILE_FAILED',
            this.constructor.name,
          ),
        );
        console.error(error);
      }
    },
  };
}
