const path = require('path');
const axios = require('axios');
const { replaceUriParameters } = require('./util');

let baseURL;
exports.setHost = host => {
  axios.defaults.baseURL = host;
  baseURL = host;
};

const send = async (webApi, uriParameters, queryParameter = {}, body = {}) => {
  if (!baseURL) throw Error('Please set HOST!');
  let requestPath = webApi.absoluteUri;
  if (uriParameters) {
    replaceUriParameters(requestPath, (match, expression) => {
      requestPath = requestPath.replace(match, uriParameters[expression]);
    });
  }

  const response = await axios(requestPath, {
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

exports.send = send;
