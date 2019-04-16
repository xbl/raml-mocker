#!/usr/bin/env node

import { join } from 'path';
import { isEmpty } from 'lodash';
import { loadApi as loadRamlApi } from 'raml-1-parser';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';

import Output from '@/output';
import { getHost } from '@/util';
import HttpClient from '@/http-client';
import Config from '@/models/config';
import RestAPI from '@/models/rest-api';
import Parameter from '@/models/parameter';
import OutputRequest from '@/models/output-request';
import { validateSchema } from '@/validate';
import { getRestApiArr, getDefinitionSchema } from '@/read-raml';
import { getResponseByStatusCode, sortByRunner, splitByParameter } from './runner-util';
import ValidateWarning from './validate-warning';
import { AxiosResponse } from 'axios';
import Schema from '@/models/schema';

const splitRestApiArr = (apiJSON: Api): RestAPI[] => {
  const result = [];
  getRestApiArr(apiJSON).forEach((restApi: RestAPI) => {
    result.push(...splitByParameter(restApi));
  });
  return result;
};

const doRequest = (httpClient: HttpClient, webApi: RestAPI): Promise<AxiosResponse<any>> => {
  const body = webApi.body ? webApi.body.text : {};
  return httpClient.send(
    webApi,
    webApi.uriParameters,
    Parameter.toJSON(webApi.queryParameters),
    body,
  );
};

export default class Runner {
  config: Config;
  output: Output;
  definitionSchema: Schema;
  httpClient: HttpClient;
  restApiArr: RestAPI[];

  constructor(config: Config, output: Output) {
    this.config = config;
    this.httpClient = new HttpClient(getHost(this.config));
    this.output = output;
  }

  async start() {
    const apiJSON = await loadRamlApi(join(this.config.raml, this.config.main)) as Api;
    this.restApiArr = sortByRunner(splitRestApiArr(apiJSON));
    if (isEmpty(this.restApiArr)) {
      return ;
    }
    this.definitionSchema = getDefinitionSchema(apiJSON);
    this.runByRunner();
  }

  validateResponse = (webApi, response) => {
    const { data, status } = response;
    if (!webApi.responses.length) {
      throw new ValidateWarning('No set responses');
    }
    const resp = getResponseByStatusCode(status, webApi.responses);
    if (!resp) {
      throw new Error(`Can\'t find responses by status ${status}`);
    }
    validateSchema(this.definitionSchema, resp.schema, data);
  }

  logError = (err, outputRequest: OutputRequest) => {
    if (err instanceof ValidateWarning) {
      this.output.push(Output.WARNING, outputRequest, err.message);
      return ;
    }
    this.output.push(Output.ERROR, outputRequest, err.message || err);
  }

  send = async (webApi: RestAPI) => {
    const outputRequest: OutputRequest =
      new OutputRequest({ path: webApi.url, method: webApi.method });
    try {
      const response = await doRequest(this.httpClient, webApi);
      outputRequest.setRealPath(response.request.path);
      this.validateResponse(webApi, response);
      this.output.push(Output.SUCCESS, outputRequest);
    } catch (err) {
      this.logError(err, outputRequest);
    }
  }

  runByRunner = async () => {
    this.restApiArr.forEach(async (webApi) => {
      if (webApi.runner) {
        await this.send(webApi);
        return;
      }
      this.send(webApi);
    });
  }

}
