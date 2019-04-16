import { isEmpty } from 'lodash';
import RestAPI from '../models/rest-api';
import Response from '../models/response';
import Parameter from '../models/parameter';

export const getResponseByStatusCode = (code: number, responses: Response[]): Response => {
  if (isEmpty(responses)) {
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
  if (isEmpty(restApiArr)) {
    return;
  }
  return restApiArr.sort((restApi) => (restApi.runner && restApi.runner.after ? -1 : 1));
};

const getGroup = (data: any[], index = 0, group = []): any[] => {
  const tempArr = [];
  tempArr.push([data[index]]);
  group.forEach((_, i) => {
    tempArr.push([...group[i], data[index]]);
  });
  group.push(...tempArr);

  if (index + 1 >= data.length) {
    return group;
  }
  return getGroup(data, index + 1, group);
};

export const splitByParameter = (restApi: RestAPI): RestAPI[] => {
  const queryParameters = restApi.queryParameters;
  if (isEmpty(queryParameters)) {
    return [restApi];
  }
  const baseRestApi = {...restApi};
  baseRestApi.queryParameters = [];
  const restApiArr = [baseRestApi];
  const newParams = getGroup(queryParameters);
  newParams.forEach((element: Parameter[]) => {
    const newRestApi: RestAPI = { ...restApi};
    newRestApi.queryParameters = element;
    restApiArr.push(newRestApi);
  });
  return restApiArr;
};
