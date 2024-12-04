import VoximplantApiClient from '@voximplant/apiclient-nodejs';

import { LogMessageGeneratorFactory } from '../../utils/log-message-generator';

export class VoximplantContext {
  client: VoximplantApiClient;

  private lmg: LogMessageGeneratorFactory =
    LogMessageGeneratorFactory.getInstance();

  constructor(private credentials: string) {}

  init = async (): Promise<void> =>
    /**
     *  TODO: Check the 'await' keyword in the `await new Promise...` solution for the 'zero-cost async stack traces' api
     *  V8 Official Documentation - https://v8.dev/docs/stack-trace-api
     *  V8 Official LLD Google Doc - https://docs.google.com/document/d/13Sy_kBIJGP0XT34V1CV3nkWya4TwYx9L3Yv45LdGB6Q/edit
     *  Outside information - https://cloudreports.net/v8-zero-cost-async-stack-traces/
     */
    await new Promise((resolve, reject) => {
      const uncaughtExceptionListener = (error: Error): void => {
        // @ts-expect-error 'error specific fields'
        if (error.code === 'ENOENT') {
          console.error(
            this.lmg.generate('ERR__INIT_FAILED', this.constructor.name),
          );
        }
        if (
          error.name === 'SyntaxError' &&
          error.message.includes('JSON input')
        ) {
          console.error(
            this.lmg.generate(
              'ERR__INIT_FAILED_WRONG_CREDENTIALS_FILE_FORMAT',
              this.constructor.name,
            ),
          );
        }
        reject(error);
      };
      process.on('uncaughtException', uncaughtExceptionListener);

      this.client = new VoximplantApiClient(this.credentials);

      this.client.onReady = (): void => {
        console.info(
          this.lmg.generate('INFO__INIT_SUCCESS', this.constructor.name),
        );
        process.off('uncaughtException', uncaughtExceptionListener);
        resolve();
      };
    });
}
