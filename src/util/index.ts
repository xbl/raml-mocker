import vm from 'vm';
import Config from '@/models/config';
import RestAPI from '@/models/rest-api';
import pathToRegexp from 'path-to-regexp';

export const isRedirectCode = (code: number): boolean => code >= 300 && code < 400;

export const jsonPath = (json: unknown, dataPath: string): unknown => {
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

export const replaceUriParameters = (uri: string, callback) =>
  uri.replace(uriParamterRegExp, callback);

export const toExpressUri = (uri: string): string => {
  let result = uri;
  replaceUriParameters(uri, (match, expression: string) => {
    result = result.replace(match, `:${expression}`);
  });
  return result;
};

export const getHost = (config: Config): string => {
  const env = process.env.NODE_ENV;
  let host = `http://localhost:${config.port}`;
  if (config.runner && env) {
    host = config.runner[env] as string;
  }
  if (!host) {
    throw Error(`Can't find host in .raml-config.json when env is "${env}"`);
  }
  return host;
};

// copy from: https://github.com/sindresorhus/indent-string
export const indentString = (
  str: string,
  count = 1,
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
): RestAPI[] => newRestAPIArr
  .map((restAPI) => {
    let result: RestAPI;
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
  .filter((restAPI) => !!restAPI);

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
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    uriMap[key.name.trim()] = result[i + 1];
  });
  return uriMap;
};

export const isJSONType = (mimeType: string): boolean => /\/json/.test(mimeType);
