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

const replaceUriParmaters = (uri, callback) =>
  uri.replace(uriParamterRegExp, callback);

exports.replaceUriParmaters = replaceUriParmaters;

exports.toExpressUri = uri => {
  let result = uri;
  replaceUriParmaters(uri, (match, expression) => {
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
