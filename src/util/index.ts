import vm from 'vm';
import { resolve } from 'path';
import Config from '@/models/config';
import RestAPI from '@/models/rest-api';
import pathToRegexp from 'path-to-regexp';
import chalk from 'chalk';
import fs from '@/util/fs';

export const isRedirectCode = (code) => code >= 300 && code < 400;

export const jsonPath = (json, dataPath) => {
  const sandbox = {
    obj: '',
    result: undefined,
  };
  vm.createContext(sandbox);
  const code = `obj = ${JSON.stringify(json)}; result = obj${dataPath}`;
  vm.runInContext(code, sandbox);
  return sandbox.result;
};

const uriParamterRegExp = /\{((?:.|\n)+?)\}/g;

export const replaceUriParameters = (uri, callback) =>
  uri.replace(uriParamterRegExp, callback);

export const toExpressUri = (uri: string): string => {
  let result = uri;
  replaceUriParameters(uri, (match, expression) => {
    result = result.replace(match, `:${expression}`);
  });
  return result;
};

export const loadConfig = async (): Promise<Config> => {
  let str;
  const configFile = '.raml-config.json';
  const currentPath = process.cwd();
  try {
    str = await fs.readFile(resolve(currentPath, `./${configFile}`), 'utf8');
  } catch (error) {
    // tslint:disable-next-line no-console
    console.log(chalk`{red 在当前目录 ${currentPath} 没有找到${configFile}配置文件}`);
    process.exit(1);
    return Promise.reject(error);
  }
  let config: Config;
  try {
    config = JSON.parse(str) as Config;
  } catch (error) {
    // tslint:disable-next-line no-console
    console.log(chalk`{red 解析${configFile}配置文件出错，不是正确的 JSON 格式。}`);
    process.exit(1);
    return Promise.reject(error);
  }
  config.raml = resolve(config.raml);
  config.controller = resolve(config.controller);
  if (Array.isArray(config.plugins)) {
    config.plugins = config.plugins.map((plugin) => resolve(plugin));
  }
  return config;
};

export const getHost = (config: Config): string => {
  const env = process.env.NODE_ENV;
  let host = `http://localhost:${config.port}`;
  if (config.runner && env) {
    host = config.runner[env];
  }
  if (!host) {
    throw Error(`Can't find host in .raml-config.json when env is "${env}"`);
  }
  return host;
};

// copy from: https://github.com/sindresorhus/indent-string
export const indentString = (
  str: string,
  count: number = 1,
  opts: object = { indent: ' ', includeEmptyLines: false },
): string => {
  // Support older versions: use the third parameter as options.indent
  // TODO: Remove the workaround in the next major version
  const options =
    typeof opts === 'object' &&
    Object.assign({ indent: ' ', includeEmptyLines: false }, opts);
  count = count === undefined ? 1 : count;

  if (typeof options.indent !== 'string') {
    throw new TypeError(
      `Expected \`options.indent\` to be a \`string\`, got \`${typeof options.indent}\``,
    );
  }

  if (count === 0) {
    return str;
  }

  const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
  return str.replace(regex, options.indent.repeat(count));
};

export const mergeRestApi = (
  newRestAPIArr: RestAPI[],
  existRestAPIArr: RestAPI[],
): RestAPI[] => {
  return newRestAPIArr
    .map((restAPI) => {
      let result;
      existRestAPIArr.forEach((existRestApi) => {
        const urlMap = urlCompare(restAPI.url, existRestApi.url);
        if (!urlMap) {
          return;
        }
        restAPI.url = existRestApi.url;
        restAPI.uriParameters = urlMap;
        restAPI.description = existRestApi.description;
        result = restAPI;
      });
      return result;
    })
    .filter((restAPI) => {
      return !!restAPI;
    });
};

export const urlCompare = (url: string, ramlUrlExpression: string): object => {
  const urlExpression = toExpressUri(ramlUrlExpression);
  const keys = [];
  const regexp = pathToRegexp(urlExpression, keys);

  if (!regexp.test(url)) {
    return;
  }
  const result = regexp.exec(url);
  const uriMap = {};
  keys.forEach((key, i) => {
    uriMap[key.name.trim()] = result[i + 1];
  });
  return uriMap;
};

export const isJSONType = (mimeType) => /\/json/.test(mimeType);
