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

// copy from: https://github.com/sindresorhus/indent-string
export const indentString = (str: string, count: number = 1, opts: object = {indent: ' ', includeEmptyLines: false}): string => {
	// Support older versions: use the third parameter as options.indent
	// TODO: Remove the workaround in the next major version
	const options = typeof opts === 'object' && Object.assign({indent: ' ', includeEmptyLines: false}, opts);
	count = count === undefined ? 1 : count;

	if (typeof str !== 'string') {
		throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof str}\``);
	}

	if (typeof count !== 'number') {
		throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof count}\``);
	}

	if (typeof options.indent !== 'string') {
		throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof options.indent}\``);
	}

	if (count === 0) {
		return str;
	}

	const regex = options.includeEmptyLines ? /^/mg : /^(?!\s*$)/mg;
	return str.replace(regex, options.indent.repeat(count));
}
