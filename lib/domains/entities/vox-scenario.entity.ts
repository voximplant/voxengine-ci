import { ScenarioInfo } from '@voximplant/apiclient-nodejs/dist/Structures';

export class VoxScenario {
  scenarioName: string;
  scenarioScript: string;

  constructor(scenarioInfo: ScenarioInfo) {
    this.scenarioName = scenarioInfo.scenarioName;
    this.scenarioScript = scenarioInfo.scenarioScript ?? '';
  }
}

export class VoxScenarioMetadata {
  scenarioId: number;
  scenarioName: string;
  hash: string;

  constructor(scenarioInfo: ScenarioInfo, hash: string) {
    this.scenarioId = scenarioInfo.scenarioId;
    this.scenarioName = scenarioInfo.scenarioName;
    this.hash = hash;
  }
}

export class VoxScenarioBuilderTsConfig {
  compilerOptions: {
    allowJs: boolean;
    target: string;
    lib: string[];
    skipLibCheck: boolean;
    noEmitOnError: boolean;
    outDir: string;
  };
  include: string[];
  exclude: string[];

  constructor(outDir: string, include: string[], exclude: string[]) {
    this.compilerOptions = {
      allowJs: true,
      target: 'ES2020',
      lib: ['ES2020'],
      skipLibCheck: true,
      noEmitOnError: true,
      outDir: outDir,
    };
    this.include = include;
    this.exclude = exclude;
  }
}
