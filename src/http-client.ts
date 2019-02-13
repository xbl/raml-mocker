import path from 'path';
import axios, { AxiosResponse } from 'axios';
import { replaceUriParameters } from './util';
import RestAPI from './models/rest-api';

let baseURL;
const setHost = host => {
  axios.defaults.baseURL = host;
  baseURL = host;
};

const send = async (webApi: RestAPI, uriParameters, queryParameter = {}, body = {}) => {
  if (!baseURL) throw Error('Please set HOST!');
  let requestPath = webApi.url;
  if (uriParameters) {
    replaceUriParameters(requestPath, (match, expression) => {
      requestPath = requestPath.replace(match, uriParameters[expression]);
    });
  }

  const response: AxiosResponse<string> = await axios(requestPath, {
    method: webApi.method,
    data: body,
    params: queryParameter
  });

  const { runner } = webApi;
  if (runner) {
    const { after } = runner;
    // eslint-disable-next-line
    const afterModule = require(path.resolve(after));
    if (typeof afterModule === 'function') {
      await afterModule(axios, response);
    }
  }
  return response;
};

export default {
  setHost,
  send
}
