import path from 'path';
import axios from 'axios';
import { isEmpty } from 'lodash';
import RestAPI from './models/rest-api';
import { replaceUriParameters } from './util';

export default class HttpClient {

  constructor(host) {
    axios.defaults.baseURL = host;
  }

  send = async (restApi: RestAPI, uriParameters, queryParameter = {}, body = {}) => {
    let requestPath = restApi.url;
    if (!isEmpty(uriParameters)) {
      replaceUriParameters(requestPath, (match, expression) => {
        requestPath = requestPath.replace(match, uriParameters[expression]);
      });
    }

    const response = await axios(requestPath, {
      method: restApi.method,
      data: body,
      params: queryParameter,
    });

    const { runner } = restApi;
    if (runner) {
      const { after } = runner;
      const afterModule = require(path.resolve(after));
      if (typeof afterModule === 'function') {
        await afterModule(axios, response);
      }
    }
    return response;
  }
}
