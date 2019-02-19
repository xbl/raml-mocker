import path from 'path';
import axios from 'axios';
import { replaceUriParameters } from './util';
import RestAPI from './models/rest-api';

export default class HttpClient {

  constructor(host) {
    axios.defaults.baseURL = host;
  }

  send = async (webApi: RestAPI, uriParameters, queryParameter = {}, body = {}) => {
    let requestPath = webApi.url;
    if (uriParameters) {
      replaceUriParameters(requestPath, (match, expression) => {
        requestPath = requestPath.replace(match, uriParameters[expression]);
      });
    }

    const response = await axios(requestPath, {
      method: webApi.method,
      data: body,
      params: queryParameter,
    });

    const { runner } = webApi;
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
