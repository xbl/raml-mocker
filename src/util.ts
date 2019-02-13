import vm from 'vm';
import { resolve } from 'path';
import Config from './models/config';

export const isRedirectCode = code => code >= 300 && code < 400;

export const jsonPath = (json, dataPath) => {
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

export const replaceUriParameters = (uri, callback) =>
  uri.replace(uriParamterRegExp, callback);

export const toExpressUri = uri => {
  let result = uri;
  replaceUriParameters(uri, (match, expression) => {
    result = result.replace(match, `:${expression}`);
  });
  return result;
};

export const loadConfig = (str): Config​​ => {
  const config = <Config>JSON.parse(str);
  config.raml = resolve(config.raml);
  config.controller = resolve(config.controller);
  if (Array.isArray(config.plugins)) {
    config.plugins = config.plugins.map(plugin => resolve(plugin));
  }
  return config;
};
