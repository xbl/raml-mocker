const vm = require('vm');
const { resolve } = require('path');

exports.isRedirectCode = code => code >= 300 && code < 400;

exports.jsonPath = (json, dataPath) => {
  const sandbox = {
    obj: '',
    result: undefined
  };
  vm.createContext(sandbox);
  const code = `obj = ${JSON.stringify(json)}; result = obj${dataPath}`;
  vm.runInContext(code, sandbox);
  return sandbox.result;
};

const uriParamterRegExp = /\{((?:.|\n)+?)\}/g;

const replaceUriParameters = (uri, callback) =>
  uri.replace(uriParamterRegExp, callback);

exports.replaceUriParameters = replaceUriParameters;

exports.toExpressUri = uri => {
  let result = uri;
  replaceUriParameters(uri, (match, expression) => {
    result = result.replace(match, `:${expression}`);
  });
  return result;
};

exports.loadConfig = str => {
  const config = JSON.parse(str);
  config.raml = resolve(config.raml);
  config.controller = resolve(config.controller);
  if (Array.isArray(config.plugins)) {
    config.plugins = config.plugins.map(plugin => resolve(plugin));
  }
  return config;
};
