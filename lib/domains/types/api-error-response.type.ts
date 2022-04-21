import { APIError } from '@voximplant/apiclient-nodejs/dist/Structures';

export type ApiErrorResponse = {
  error: APIError;
  errors: APIError[];
};

export const isApiErrorResponse = (
  response: unknown,
): response is ApiErrorResponse =>
  Boolean(response) &&
  typeof response === 'object' &&
  Boolean('error' in response);
