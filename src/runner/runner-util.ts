import RestAPI from '../models/rest-api';
import Response from '../models/response';

export const getResponseByStatusCode = (code: number, responses: Response[]): Response => {
  if (!Array.isArray(responses)) {
    return;
  }
  let response;
  responses.forEach((resp) => {
    if (resp.code === code) {
      response = resp;
    }
  });
  return response;
};

export const sortByRunner = (restApiArr: RestAPI[]): RestAPI[] => {
  if (!Array.isArray(restApiArr)) {
    return;
  }
  return restApiArr.sort((restApi) => (restApi.runner && restApi.runner.after ? -1 : 1))
};
