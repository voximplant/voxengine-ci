import { join } from 'path';

import { AbstractPersistentRepository } from './abstract.persistent.repository';
import {
  VoxScenario,
  VoxScenarioBuilderTsConfig,
  VoxScenarioMetadata,
} from '../entities/vox-scenario.entity';
import { FileSystemContext } from '../contexts/filesystem.context';

export class VoxScenarioPersistentRepository extends AbstractPersistentRepository {
  relativeStoragePath = 'scenarios';

  private srcStorageName = 'src';
  private relativeSrcStoragePath = join(
    this.relativeStoragePath,
    this.srcStorageName,
  );

  private distStorageName = 'dist';
  private relativeDistStoragePath = join(
    this.relativeStoragePath,
    this.distStorageName,
  );

  private availableExtensions = ['ts', 'js'];

  private nameSuffix = 'voxengine';
  private metadataNameSuffix = 'metadata.config';

  private typingsVoxengineName = 'voxengine.d.ts';
  private typingsLibsName = 'libs.d.ts';

  private relativeTypingsPath = 'typings';

  private relativeTypingsVoxenginePath = join(
    '..',
    this.relativeTypingsPath,
    this.typingsVoxengineName,
  );
  // TODO: Need to think about it...
  private relativeNodeModulesTypingsVoxenginePath = join(
    '..',
    'node_modules',
    '@voximplant',
    'voxengine-ci',
    this.relativeTypingsPath,
    this.typingsVoxengineName,
  );

  private relativeTypingsLibsPath = join(
    '..',
    this.relativeTypingsPath,
    this.typingsLibsName,
  );
  // TODO: Need to think about it...
  private relativeNodeModulesTypingsLibsPath = join(
    '..',
    'node_modules',
    '@voximplant',
    'voxengine-ci',
    this.relativeTypingsPath,
    this.typingsLibsName,
  );

  private tsConfigBasename = 'tsconfig.voxengine.temp';
  private tsConfigExtension = 'json';
  private tsConfigName = `${this.tsConfigBasename}.${this.tsConfigExtension}`;

  constructor(context: FileSystemContext) {
    super(context);
  }

  // TODO: Implement specific methods for 'VoxScenarioFileSystemRepository' class

  init = async (): Promise<void> => {
    await this.context.client.createDirectory(this.relativeStoragePath);
    await this.context.client.createDirectory(this.relativeSrcStoragePath);
    await this.context.client.createDirectory(this.relativeDistStoragePath);

    await this.context.client.createMetadataDirectory(this.relativeStoragePath);
    await this.context.client.createMetadataDirectory(
      this.relativeSrcStoragePath,
    );
    await this.context.client.createMetadataDirectory(
      this.relativeDistStoragePath,
    );
    console.info(
      this.lmg.generate('INFO__INIT_SUCCESS', this.constructor.name),
    );
  };

  link = async (): Promise<void> => {
    await this.context.client.createDirectory(this.relativeStoragePath);
    await this.linkSrc();
    await this.linkDist();
  };

  unlink = async (): Promise<void> => {
    await this.context.client.removeDirectory(this.relativeStoragePath);
  };

  linkSrc = async (): Promise<void> => {
    await this.context.client.createDirectory(this.relativeSrcStoragePath);
  };

  unlinkSrc = async (): Promise<void> => {
    await this.context.client.removeDirectory(this.relativeSrcStoragePath);
  };

  linkDist = async (): Promise<void> => {
    await this.context.client.createDirectory(this.relativeDistStoragePath);
  };

  unlinkDist = async (): Promise<void> => {
    await this.context.client.removeDirectory(this.relativeDistStoragePath);
  };

  linkMetadata = async (): Promise<void> => {
    await this.context.client.createMetadataDirectory(this.relativeStoragePath);
    await this.linkSrcMetadata();
    await this.linkDistMetadata();
  };

  unlinkMetadata = async (): Promise<void> => {
    await this.context.client.removeMetadataDirectory(this.relativeStoragePath);
  };

  linkSrcMetadata = async (): Promise<void> => {
    await this.context.client.createMetadataDirectory(
      this.relativeSrcStoragePath,
    );
  };

  linkDistMetadata = async (): Promise<void> => {
    await this.context.client.createMetadataDirectory(
      this.relativeDistStoragePath,
    );
  };

  create = async (voxScenario: VoxScenario): Promise<void> => {
    try {
      const { scenarioName, scenarioScript } = voxScenario;
      const fileBasename = `${scenarioName}.${this.nameSuffix}`;
      await this.context.client.createFile(
        this.relativeSrcStoragePath,
        fileBasename,
        scenarioScript,
        this.availableExtensions[1],
      );
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__CREATE_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  createOrUpdateTsConfig = async (scenarios: string[] = []): Promise<void> => {
    try {
      const outDir = this.context.client.resolvePath(
        this.relativeDistStoragePath,
      );

      const resolvedTypingsVoxenginePath = this.context.client.resolvePath(
        this.relativeTypingsVoxenginePath,
      );
      const resolvedNodeModulesTypingsVoxenginePath =
        this.context.client.resolvePath(
          this.relativeNodeModulesTypingsVoxenginePath,
        );
      const resolvedTypingsLibsPath = this.context.client.resolvePath(
        this.relativeTypingsLibsPath,
      );
      const resolvedNodeModulesTypingsLibsPath =
        this.context.client.resolvePath(
          this.relativeNodeModulesTypingsLibsPath,
        );
      const include = [
        resolvedTypingsVoxenginePath,
        resolvedNodeModulesTypingsVoxenginePath,
        resolvedTypingsLibsPath,
        resolvedNodeModulesTypingsLibsPath,
      ];

      const exclude = ['node_modules', '**/*.spec.ts'];

      const tsConfig: VoxScenarioBuilderTsConfig =
        new VoxScenarioBuilderTsConfig(outDir, include, exclude);

      for (const scenario of scenarios) {
        const basename = `${scenario}.${this.nameSuffix}`;
        const joinedPath = join(this.relativeSrcStoragePath, basename);
        const pathList = this.availableExtensions.map((extension) =>
          this.context.client.resolvePath(`${joinedPath}.${extension}`),
        );
        let curScenarioExists = false;
        for (const path of pathList) {
          const isExists = this.context.client.checkExists(path);
          if (isExists) {
            curScenarioExists = true;
            tsConfig.include.push(path);
            console.info(
              this.lmg.generate(
                'INFO__SCENARIO_ADDED_TO_TSCONFIG',
                path,
                this.tsConfigBasename,
              ),
            );
          }
        }
        if (!curScenarioExists) {
          throw new Error(
            this.lmg.generate('ERR__SCENARIO_DOES_NOT_EXIST', joinedPath),
          );
        }
      }
      await this.context.client.createOrUpdateFile(
        '.',
        this.tsConfigBasename,
        JSON.stringify(tsConfig),
        this.tsConfigExtension,
      );
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__CREATE_OR_UPDATE_TSCONFIG_FAILED',
          this.constructor.name,
        ),
      );
      throw error;
    }
  };

  getTsConfigPath = (): string => {
    return this.context.client.resolvePath(this.tsConfigName);
  };

  removeTsConfig = async (): Promise<void> => {
    await this.context.client.removeFile(this.tsConfigBasename);
  };

  createMetadata = async (
    voxScenarioMetadata: VoxScenarioMetadata,
  ): Promise<void> => {
    try {
      const { scenarioName } = voxScenarioMetadata;
      const basename = `${scenarioName}.${this.metadataNameSuffix}`;
      await this.context.client.createMetadataFile(
        this.relativeDistStoragePath,
        basename,
        JSON.stringify(voxScenarioMetadata),
      );
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__CREATE_METADATA_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  createOrUpdate = async (voxScenario: VoxScenario): Promise<void> => {
    try {
      const { scenarioName, scenarioScript } = voxScenario;
      const basename = `${scenarioName}.${this.nameSuffix}`;
      await this.context.client.createOrUpdateFile(
        this.relativeSrcStoragePath,
        basename,
        scenarioScript,
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
    voxScenarioMetadata: VoxScenarioMetadata,
  ): Promise<void> => {
    try {
      const { scenarioName } = voxScenarioMetadata;
      const basename = `${scenarioName}.${this.metadataNameSuffix}`;
      await this.context.client.createOrUpdateMetadataFile(
        this.relativeDistStoragePath,
        basename,
        JSON.stringify(voxScenarioMetadata),
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

  readSrc = async (scenarioName: string): Promise<string> => {
    try {
      const joinedPath = join(this.relativeSrcStoragePath, scenarioName);
      return await this.context.client.readFile(joinedPath);
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__READ_SRC_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  readDist = async (scenarioName: string): Promise<string> => {
    try {
      const joinedPath = join(
        this.relativeDistStoragePath,
        `${scenarioName}.${this.nameSuffix}`,
      );
      return await this.context.client.readFile(joinedPath);
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__READ_DIST_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  readSrcMetadata = async (scenarioName: string): Promise<string> => {
    try {
      const joinedPath = join(
        this.relativeSrcStoragePath,
        `${scenarioName}.${this.metadataNameSuffix}`,
      );
      return await this.context.client.readMetadataFile(joinedPath);
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__READ_SRC_METADATA_FAILED',
          this.constructor.name,
        ),
      );
      console.error(error);
    }
  };

  readDistMetadata = async (scenarioName: string): Promise<string> => {
    try {
      const joinedPath = join(
        this.relativeDistStoragePath,
        `${scenarioName}.${this.metadataNameSuffix}`,
      );
      return await this.context.client.readMetadataFile(joinedPath);
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__READ_DIST_METADATA_FAILED',
          this.constructor.name,
        ),
      );
      console.error(error);
    }
  };
}
