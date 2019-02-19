#!/usr/bin/env node

import fs from 'fs';
import { join } from 'path';
import { getRestApiArr, getDefinitionSchema } from '../read-raml';
import { validateSchema } from '../validate';
import { loadConfig } from '../util';
import Output from '../output';
import HttpClient from '../http-client';
import RestAPI from '../models/rest-api';
import { loadApiSync } from 'raml-1-parser';

const config = loadConfig(fs.readFileSync('./.raml-config.json', 'utf8'));

const env = process.env.NODE_ENV;
let host = `http://localhost:${config.port}`;
if (config.runner && env) {
  host = config.runner[env];
}

const apiJSON = loadApiSync(join(config.raml, config.main));
const webApiArr = getRestApiArr(apiJSON);
const definitionSchema = getDefinitionSchema(apiJSON);
const output = new Output(host);

const getResponseByStatusCode = (code, responses) => {
  let response;
  responses.forEach((resp) => {
    if (resp.code === code) {
      response = resp;
    }
  });
  return response;
};

HttpClient.setHost(host);

const send = async (webApi: RestAPI, uriParameters, queryParameter, body) => {
  const beginTime = Date.now();
  try {
    const { data, request, status } = await HttpClient.send(
      webApi,
      uriParameters,
      queryParameter,
      body,
    );

    if (!webApi.responses.length) {
      output.push(Output.WARNING, 'No set responses', '', request, beginTime);
      return;
    }

    const resp = getResponseByStatusCode(status, webApi.responses);

    if (!resp) {
      output.push(
        Output.ERROR,
        'Can\'t find code by responses',
        '',
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
      // eslint-disable-next-line no-underscore-dangle
      { path: webApi.url, method: webApi.method },
      beginTime,
    );
  }
};

webApiArr.sort((webApi) => (webApi.runner && webApi.runner.after ? -1 : 1));

const sendRunner = async () => {
  const webApi = webApiArr.shift();
  if (!webApi.runner) {
    webApiArr.unshift(webApi);
    webApiArr.forEach((aa) => {
      const body = aa.body ? aa.body.text : {};
      send(aa, aa.uriParameters, aa.queryParameter, body);
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
