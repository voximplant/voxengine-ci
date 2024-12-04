import { APIErrorCode } from '@voximplant/apiclient-nodejs/dist/Enums';
import { RuleInfo } from '@voximplant/apiclient-nodejs/dist/Structures';

import {
  AddRuleRequest,
  AddRuleResponse,
  SetRuleInfoResponse,
} from '@voximplant/apiclient-nodejs/dist/Interfaces';
import { VoximplantContext } from '../contexts/voximplant.context';
import { isApiErrorResponse } from '../types/api-error-response.type';
import { LogMessageGeneratorFactory } from '../../utils/log-message-generator';

export class VoxRulePlatformRepository {
  private lmg: LogMessageGeneratorFactory =
    LogMessageGeneratorFactory.getInstance();

  constructor(public context: VoximplantContext) {}

  init = () => {
    console.info(
      this.lmg.generate('INFO__INIT_SUCCESS', this.constructor.name),
    );
  };

  downloadApplicationRules = async (
    applicationId: number,
    applicationName: string,
  ): Promise<RuleInfo[]> => {
    const response = await this.context.client.Rules.getRules({
      applicationId,
      applicationName,
    });
    if (isApiErrorResponse(response)) {
      throw new Error(
        this.lmg.generate(
          'ERR__VOXIMPLANT_API_ERROR',
          APIErrorCode[response.error.code],
        ),
      );
    }
    if (response.totalCount === 0) {
      console.info(
        this.lmg.generate('INFO__APP_DOESNT_HAVE_RULES', applicationName),
      );
      return [];
    }
    const { result } = await this.context.client.Rules.getRules({
      applicationId,
      applicationName,
      withScenarios: true,
      count: response.totalCount,
    });
    console.info(
      this.lmg.generate(
        'INFO__RULES_DOWNLOADED',
        applicationId.toString(),
        applicationName,
      ),
    );
    return result;
  };

  addRule = async (
    applicationId: number,
    ruleName: string,
    scenarioId: number[],
    rulePattern: string,
  ): Promise<number> => {
    const addRuleRequest: AddRuleRequest = {
      applicationId,
      applicationName: '',
      ruleName,
      rulePattern,
      scenarioName: '',
      scenarioId,
    };
    const response: AddRuleResponse = await this.context.client.Rules.addRule(
      addRuleRequest,
    );
    if (isApiErrorResponse(response)) {
      throw new Error(
        this.lmg.generate(
          'ERR__VOXIMPLANT_API_ERROR',
          APIErrorCode[response.error.code],
        ),
      );
    }
    const { ruleId } = response;
    console.info(
      this.lmg.generate('INFO__RULE_UPLOADED', ruleId.toString(), ruleName),
    );
    return ruleId;
  };

  setRuleInfo = async (rulePattern: string, ruleId: number) => {
    const response: SetRuleInfoResponse =
      await this.context.client.Rules.setRuleInfo({ ruleId, rulePattern });
    if (isApiErrorResponse(response)) {
      throw new Error(
        this.lmg.generate(
          'ERR__VOXIMPLANT_API_ERROR',
          APIErrorCode[response.error.code],
        ),
      );
    }
    console.info(this.lmg.generate('INFO__RULE_UPDATED', ruleId.toString()));
  };

  reorderRules = async (rulesIds: number[]) => {
    const response = await this.context.client.Rules.reorderRules({
      ruleId: rulesIds,
    });
    if (isApiErrorResponse(response)) {
      throw new Error(
        this.lmg.generate(
          'ERR__VOXIMPLANT_API_ERROR',
          APIErrorCode[response.error.code],
        ),
      );
    }
    console.info(
      this.lmg.generate('INFO__RULES_REORDERED', rulesIds.toString()),
    );
  };
}
