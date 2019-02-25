#!/usr/bin/env node

import { join } from 'path';
import { isEmpty } from 'lodash';
import { loadApi as loadRamlApi } from 'raml-1-parser';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';

import Output from '../output';
import HttpClient from '../http-client';
import Config from '../models/config';
import RestAPI from '../models/rest-api';
import Parameter from '../models/parameter';
import { validateSchema } from '../validate';
import { getRestApiArr, getDefinitionSchema } from '../read-raml';
import { getResponseByStatusCode, sortByRunner, splitByParameter } from './runner-util';

const splitRestApiArr = (apiJSON: Api) => {
  const result = [];
  getRestApiArr(apiJSON).forEach((restApi: RestAPI) => {
    result.push(...splitByParameter(restApi));
  });
  return result;
};

export default async (config: Config, output: Output, host: string) => {
  const apiJSON = await loadRamlApi(join(config.raml, config.main)) as Api;
  const restApiArr = sortByRunner(splitRestApiArr(apiJSON));
  if (isEmpty(restApiArr)) {
    return ;
  }
  const definitionSchema = getDefinitionSchema(apiJSON);
  const httpClient = new HttpClient(host);

  const send = async (webApi: RestAPI) => {
    const beginTime = Date.now();
    let absoluteUri = webApi.url;
    try {
      const body = webApi.body ? webApi.body.text : {};
      const { data, request, status } = await httpClient.send(
        webApi,
        webApi.uriParameters,
        Parameter.toJSON(webApi.queryParameters),
        body,
      );

      absoluteUri = request.path;
      if (!webApi.responses.length) {
        output.push(Output.WARNING, 'No set responses', request, beginTime);
        return;
      }

      const resp = getResponseByStatusCode(status, webApi.responses);
      if (!resp) {
        throw new Error('Can\'t find code by responses');
      }

      if (resp.schema) {
        validateSchema(definitionSchema, resp.schema, data);
      }

      output.push(Output.SUCCESS, '', request, beginTime);
    } catch (err) {
      output.push(
        Output.ERROR,
        err.message || err,
        { path: absoluteUri, method: webApi.method },
        beginTime,
      );
    }
  };

  const runByRunner = async () => {
    restApiArr.forEach(async (webApi) => {
      if (webApi.runner) {
        await send(webApi);
        return;
      }
      send(webApi);
    });
  };

  runByRunner();
};
