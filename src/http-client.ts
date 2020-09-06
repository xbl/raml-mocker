import path from 'path';
import axios from 'axios';
import { isEmpty } from 'lodash';
import RestAPI from './models/rest-api';
import { replaceUriParameters } from './util';

export default class HttpClient {

  constructor(host: string) {
    axios.defaults.baseURL = host;
  }

  send = async (restApi: RestAPI, uriParameters, queryParameter = {}, body = {}) => {
    let requestPath = restApi.url;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const afterModule = require(path.resolve(after));
      if (typeof afterModule === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await afterModule(axios, response);
      }
    }
    return response;
  };
}
