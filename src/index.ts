import { join } from 'path';
import HttpClient from './http-client';
import { getRestApiArr } from './read-raml';
import { loadConfig } from './util';
import { loadApi as loadRamlApi } from 'raml-1-parser';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';

let restApiArr;
let httpClient: HttpClient;

export const initProject = async () => {
  const env = process.env.NODE_ENV;
  const config = await loadConfig();
  let host = `http://localhost:${config.port}`;
  if (config.runner && env) {
    host = config.runner[env];
  }
  if (!host) {
    throw Error(`Can't find host in .raml-config.json when env is "${env}"`);
  }
  httpClient = new HttpClient(host);

  const apiJSON = await loadRamlApi(join(config.raml, config.main)) as Api;
  restApiArr = getRestApiArr(apiJSON);
};

export const loadApi = (description: string) => {
  if (!description) { throw Error('Please set API description!'); }
  if (!restApiArr) { throw Error('Can\'t find API'); }
  const api = restApiArr
    .filter((restApi) => restApi.description === description)
    .pop();
  if (!api) { throw Error(`Can't find API by '${description}'!`); }
  return async (uriParameters, queryParameter, body) => {
    try {
      return await httpClient.send(api, uriParameters, queryParameter, body);
    } catch (error) {
      throw new Error(`description: '${description}' ${error.message}`);
    }
  };
};
