#!/usr/bin/env node

import { join } from 'path';
import { loadApi as loadRamlApi } from 'raml-1-parser';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';

import Output from '../output';
import Config from '../models/config';
import HttpClient from '../http-client';
import RestAPI from '../models/rest-api';
import { validateSchema } from '../validate';
import { getRestApiArr, getDefinitionSchema } from '../read-raml';

const getResponseByStatusCode = (code, responses) => {
  let response;
  responses.forEach((resp) => {
    if (resp.code === code) {
      response = resp;
    }
  });
  return response;
};

const sortByRunner = (restApiArr) =>
  restApiArr.sort((webApi) => (webApi.runner && webApi.runner.after ? -1 : 1));

export default async (config: Config) => {
  const env = process.env.NODE_ENV;
  let host = `http://localhost:${config.port}`;
  if (config.runner && env) {
    host = config.runner[env];
  }

  const apiJSON = await loadRamlApi(join(config.raml, config.main)) as Api;
  const restApiArr = sortByRunner(getRestApiArr(apiJSON));
  const definitionSchema = getDefinitionSchema(apiJSON);
  const output = new Output(host);
  const httpClient = new HttpClient(host);

  const send = async (webApi: RestAPI, uriParameters, queryParameter, body) => {
    const beginTime = Date.now();
    try {
      const { data, request, status } = await httpClient.send(
        webApi,
        uriParameters,
        queryParameter,
        body,
      );

      if (!webApi.responses.length) {
        output.push(Output.WARNING, 'No set responses', request, beginTime);
        return;
      }

      const resp = getResponseByStatusCode(status, webApi.responses);

      if (!resp) {
        output.push(
          Output.ERROR,
          'Can\'t find code by responses',
          request,
          beginTime,
        );
        return;
      }

      if (!resp.schema) {
        output.push(Output.SUCCESS, '', request, beginTime);
        return;
      }

      try {
        const { valid, message } = validateSchema(
          definitionSchema,
          resp.schema,
          data,
        );
        const type = valid ? Output.SUCCESS : Output.ERROR;
        output.push(type, message, request, beginTime);
      } catch (error) {
        output.push(Output.ERROR, error.message, request, beginTime);
      }
    } catch (err) {
      output.push(
        Output.ERROR,
        err.message || err,
        { path: webApi.url, method: webApi.method },
        beginTime,
      );
    }
  };

  const sendRunner = async () => {
    const webApi = restApiArr.shift();
    if (!webApi.runner) {
      restApiArr.unshift(webApi);
      restApiArr.forEach((aa) => {
        send(aa, aa.uriParameters, aa.queryParameter, aa.body ? aa.body.text : {});
      });
      return;
    }
    const body = webApi.body ? webApi.body.text : {};
    await send(webApi, webApi.uriParameters, webApi.queryParameter, body);
    sendRunner();
  };

  sendRunner();

  process.on('beforeExit', () => {
    output.print();
  });

};
