import { promisify } from 'util';
import { createHash } from 'crypto';
import { exec } from 'child_process';

import {
  VoxScenario,
  VoxScenarioMetadata,
} from '../entities/vox-scenario.entity';
import { VoxScenarioPersistentRepository } from '../repositories/vox-scenario.persistent.repository';
import { VoxScenarioPlatformRepository } from '../repositories/vox-scenario.platform.repository';
import { FullVoxScenarioInfo } from '../types/vox-scenario.type';
import { BindScenarioRequest } from '@voximplant/apiclient-nodejs/dist/Interfaces';
import { LogMessageGeneratorFactory } from '../../utils/logMessageGenerator';
import { ScenarioInfo } from '@voximplant/apiclient-nodejs/dist/Structures';

const asyncExec = promisify(exec);

export class VoxScenarioService {
  private lmg = LogMessageGeneratorFactory.getInstance();

  constructor(
    private platformRepository: VoxScenarioPlatformRepository,
    private persistentRepository: VoxScenarioPersistentRepository,
  ) {}

  init = () => {
    console.info(
      this.lmg.generate('INFO__INIT_SUCCESS', this.constructor.name),
    );
  };

  private generateHash = (data: string): string =>
    createHash('sha256').update(data).digest('hex');

  cleanup = async (): Promise<void> => {
    await this.persistentRepository.unlink();
    await this.persistentRepository.link();
    await this.persistentRepository.unlinkMetadata();
    await this.persistentRepository.linkMetadata();
  };

  cleanupSrc = async (): Promise<void> => {
    await this.persistentRepository.unlinkSrc();
    await this.persistentRepository.linkSrc();
  };

  cleanupDist = async (): Promise<void> => {
    await this.persistentRepository.unlinkDist();
    await this.persistentRepository.linkDist();
  };

  checkScenariosAlreadyExists = async (): Promise<boolean> => {
    try {
      const scenarios = await this.persistentRepository.readStorage();
      const scenariosMetadata =
        await this.persistentRepository.readMetadataStorage();
      return !!scenarios.length && !!scenariosMetadata.length;
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__CHECK_SCENARIO_ALREADY_EXISTS_FAILED',
          this.constructor.name,
        ),
      );
      console.error(error);
    }
  };

  checkScenariosNames = (rawScenarios: FullVoxScenarioInfo[]) => {
    if (!rawScenarios || !rawScenarios.length) return;
    const scenariosNamesGrouped = rawScenarios.reduce(
      (acc: Record<string, string[]>, scenario) => {
        const { scenarioName } = scenario;
        const scenarioNameLowCase = scenarioName.toLowerCase();
        if (acc && acc[scenarioNameLowCase]) {
          acc[scenarioNameLowCase].push(scenarioName);
        } else {
          acc[scenarioNameLowCase] = [scenarioName];
        }
        return acc;
      },
      {},
    );
    const duplicatedNames = Object.values(scenariosNamesGrouped).filter(
      (names) => names.length > 1,
    );
    if (duplicatedNames.length) {
      throw new Error(
        this.lmg.generate('INFO__SAME_SCENARIOS', duplicatedNames.toString()),
      );
    }
  };

  downloadScenarios = async (): Promise<FullVoxScenarioInfo[]> => {
    return await this.platformRepository.downloadScenarios();
  };

  downloadScenarioWithScript = async (
    rawScenario: FullVoxScenarioInfo,
  ): Promise<FullVoxScenarioInfo> => {
    try {
      const { scenarioId } = rawScenario;
      const scenario: FullVoxScenarioInfo =
        await this.platformRepository.downloadScenarioById(scenarioId);
      if (!scenario) {
        throw new Error(
          this.lmg.generate(
            'ERR__SCENARIO_BY_ID_IS_NOT_FOUND',
            scenarioId.toString(),
          ),
        );
      }
      return scenario;
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__DOWNLOAD_SCENARIO_WITH_SCRIPT_FAILED',
          this.constructor.name,
        ),
      );
      console.error(error);
    }
  };

  downloadScenarioWithoutScript = async (
    rawScenario: FullVoxScenarioInfo,
  ): Promise<FullVoxScenarioInfo> => {
    try {
      const { scenarioName } = rawScenario;
      const scenario: FullVoxScenarioInfo =
        await this.platformRepository.downloadScenarioByName(scenarioName);
      if (!scenario) {
        throw new Error(
          this.lmg.generate('ERR__SCENARIO_BY_NAME_IS_NOT_FOUND', scenarioName),
        );
      }
      return scenario;
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__DOWNLOAD_SCENARIO_WITHOUT_SCRIPT_FAILED',
          this.constructor.name,
        ),
      );
      console.error(error);
    }
  };

  saveScenario = async (rawScenario: FullVoxScenarioInfo) => {
    try {
      const voxScenario: VoxScenario = new VoxScenario(rawScenario);
      await this.persistentRepository.create(voxScenario);
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__SAVE_SCENARIO_FAILED', this.constructor.name),
      );
      console.error(error);
    }
  };

  addScenariosToRule = async (bindScenarioRequest: BindScenarioRequest) => {
    try {
      return await this.platformRepository.bindScenarios(bindScenarioRequest);
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__ADD_SCENARIOS_TO_RULE_FAILED',
          this.constructor.name,
        ),
      );
      console.error(error);
    }
  };

  saveScenarioMetadata = async (rawScenario: FullVoxScenarioInfo) => {
    try {
      const hash = this.generateHash(rawScenario.scenarioScript);
      const voxScenarioMetadata: VoxScenarioMetadata = new VoxScenarioMetadata(
        rawScenario,
        hash,
      );
      await this.persistentRepository.createMetadata(voxScenarioMetadata);
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__SAVE_SCENARIO_METADATA_FAILED',
          this.constructor.name,
        ),
      );
      console.error(error);
    }
  };

  getScenarioInfoFromPlatform = async (
    scenarioNames: string[],
  ): Promise<ScenarioInfo[]> => {
    const allScenarios = await this.platformRepository.downloadScenarios();
    const scenarios = scenarioNames
      .map((scenarioName) =>
        allScenarios.find((scenario) => scenario.scenarioName === scenarioName),
      )
      .filter((scenario) => scenario);
    return scenarios;
  };

  getScenariosMetadata = async (
    scenariosNames: string[],
  ): Promise<VoxScenarioMetadata[]> => {
    const scenariosMetadata = [];
    try {
      for (const scenarioName of scenariosNames) {
        const stringDistScenarioMetadata: string =
          await this.persistentRepository.readDistMetadata(scenarioName);
        const scenario = <VoxScenarioMetadata>(
          JSON.parse(stringDistScenarioMetadata)
        );
        scenariosMetadata.push({
          scenarioId: scenario.scenarioId,
          hash: scenario.hash,
          scenarioName: scenario.scenarioName,
        });
      }
    } catch (error) {
      console.error(
        this.lmg.generate(
          'ERR__GET_SCENARIOS_METADATA_FAILED',
          this.constructor.name,
        ),
      );
    }
    return scenariosMetadata;
  };

  /**
   * TODO: The `build` method need to return something
   */
  build = async (scenarios: string[] = []): Promise<void> => {
    try {
      await this.persistentRepository.createOrUpdateTsConfig(scenarios);
      const tsConfigPath = this.persistentRepository.getTsConfigPath();
      try {
        await asyncExec(`tsc -p ${tsConfigPath}`);
      } catch (compileError) {
        console.error(
          this.lmg.generate(
            'ERR__SCENARIOS_COMPILATION_FAILED',
            scenarios.toString(),
          ),
        );
        throw compileError;
      }
      console.info(
        this.lmg.generate('INFO__SCENARIOS_BUILT', scenarios.toString()),
      );
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__BUILD_FAILED', this.constructor.name),
      );
      throw error;
    } finally {
      await this.persistentRepository.removeTsConfig();
    }
  };

  upload = async (scenarios: string[] = [], isForce = false): Promise<void> => {
    try {
      for (const scenarioName of scenarios) {
        const distScenario = await this.persistentRepository.readDist(
          scenarioName,
        );
        if (!distScenario && distScenario !== '') {
          throw new Error(
            this.lmg.generate('ERR__SCENARIO_DIST_IS_NOT_FOUND', scenarioName),
          );
        }

        const distScenarioHash = this.generateHash(distScenario);

        let stringDistScenarioMetadata: string =
          await this.persistentRepository.readDistMetadata(scenarioName);

        const platformScenarioInfo: FullVoxScenarioInfo =
          await this.platformRepository.downloadScenarioByName(scenarioName);

        // Brand new scenario
        if (!stringDistScenarioMetadata && !platformScenarioInfo) {
          const addScenarioResult: number =
            await this.platformRepository.addScenario(
              scenarioName,
              distScenario,
            );
          if (!addScenarioResult) {
            throw new Error(
              this.lmg.generate('ERR__SCENARIO_IS_NOT_ADDED', scenarioName),
            );
          }
          const platformScenarioInfoWithoutScript: FullVoxScenarioInfo =
            await this.platformRepository.downloadScenarioByName(scenarioName);
          if (!platformScenarioInfoWithoutScript) {
            throw new Error(
              this.lmg.generate(
                'ERR__SCENARIO_BY_NAME_IS_NOT_FOUND_AFTER_ADDING',
                scenarioName,
              ),
            );
          }
          const voxScenarioMetadata: VoxScenarioMetadata =
            new VoxScenarioMetadata(
              platformScenarioInfoWithoutScript,
              distScenarioHash,
            );
          await this.persistentRepository.createOrUpdateMetadata(
            voxScenarioMetadata,
          );
          continue;
        }

        // No metadata for the existing scenario
        if (!stringDistScenarioMetadata && platformScenarioInfo) {
          const platformScenarioHash = this.generateHash(
            platformScenarioInfo.scenarioScript,
          );
          const voxScenarioMetadata: VoxScenarioMetadata =
            new VoxScenarioMetadata(platformScenarioInfo, platformScenarioHash);
          await this.persistentRepository.createOrUpdateMetadata(
            voxScenarioMetadata,
          );
          stringDistScenarioMetadata =
            await this.persistentRepository.readDistMetadata(scenarioName);
        }

        // Updating the existing scenario
        if (stringDistScenarioMetadata && platformScenarioInfo) {
          const rawDistScenarioMetadata = <VoxScenarioMetadata>(
            JSON.parse(stringDistScenarioMetadata)
          );
          const metadataScenarioHash: string = rawDistScenarioMetadata.hash;
          if (distScenarioHash === metadataScenarioHash) {
            console.info(
              this.lmg.generate('INFO__SCENARIO_NOT_CHANGED', scenarioName),
            );
            continue;
          }

          console.info(
            this.lmg.generate('INFO__SCENARIO_CHANGED', scenarioName),
          );
          const scenarioId: number = rawDistScenarioMetadata.scenarioId;

          const platformScenarioInfoWithScript: FullVoxScenarioInfo =
            await this.platformRepository.downloadScenarioById(scenarioId);
          if (!platformScenarioInfoWithScript) {
            throw new Error(
              this.lmg.generate(
                'ERR__SCENARIO_BY_ID_AND_NAME_IS_NOT_FOUND_AFTER_ADDING',
                scenarioId.toString(),
                scenarioName,
              ),
            );
          }

          const platformScenarioScript: string =
            platformScenarioInfoWithScript.scenarioScript;
          const platformScenarioHash: string = this.generateHash(
            platformScenarioScript,
          );

          const platformChanges = metadataScenarioHash !== platformScenarioHash;

          // If there are platform changes that emit aborting the operation (no '--force' flag has been provided)
          if (platformChanges && !isForce) {
            throw new Error(
              this.lmg.generate(
                'ERR__SCENARIO_IS_CHANGED_FROM_THE_PLATFORM',
                scenarioId.toString(),
                scenarioName,
              ),
            );
          }

          // Alert about '--force' flag using to prevent the 'platform changes' aborting
          if (platformChanges && isForce) {
            console.info(
              this.lmg.generate(
                'INFO__SCENARIO_FORCE_CHANGE',
                scenarioId.toString(),
                scenarioName,
              ),
            );
          }
          const updateScenarioResult: number =
            await this.platformRepository.updateScenario(
              scenarioId,
              scenarioName,
              distScenario,
            );
          if (!updateScenarioResult) {
            throw new Error(
              this.lmg.generate(
                'ERR__SCENARIO_IS_NOT_UPDATED',
                scenarioName,
                scenarioId.toString(),
              ),
            );
          }
          const voxScenarioMetadata: VoxScenarioMetadata =
            new VoxScenarioMetadata(
              platformScenarioInfoWithScript,
              distScenarioHash,
            );
          await this.persistentRepository.createOrUpdateMetadata(
            voxScenarioMetadata,
          );
        }
      }
    } catch (error) {
      console.error(
        this.lmg.generate('ERR__UPLOAD_FAILED', this.constructor.name),
      );
      throw error;
    }
  };
}
