const vm = require('vm');

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
