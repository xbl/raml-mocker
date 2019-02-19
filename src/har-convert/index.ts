import { extname, join } from 'path';
import { appendFile, readFile } from 'fs';
import { promisify } from 'util';
import xhrFilter from './xhr';
import urlUtil from 'url';
import RestAPI from '../models/rest-api';
import toRaml from './to-raml';
import toSpec from './to-spec';
import { loadApiSync } from 'raml-1-parser';
import { loadConfig, mergeRestApi } from '../util';
import { getRestApiArr } from '../read-raml';
import filterPath from './filter-path';

const appendFileAsync = promisify(appendFile);
const readFileSync = promisify(readFile);

const filterEmpty = (obj) => JSON.parse(JSON.stringify(obj));

const toParameter = (queryStrings: any[]) =>
  queryStrings.reduce((accumulator, {name, value}) => {
    return Object.assign(accumulator, {[name]: decodeURIComponent(value)});
  }, {});

const toRestAPI = (entries: any[]) => entries.map((entry) => {
  const { request, response } = entry;
  const { url, method, queryString, postData } = request;
  const newUrl = urlUtil.parse(url);

  const {
    status,
    content: { mimeType, text },
  } = response;

  return filterEmpty({
    url: newUrl.pathname,
    description: `${method.toLowerCase()}${ newUrl.pathname.replace(/\//g, '_') }`,
    method,
    queryParameter: toParameter(queryString),
    body: postData,
    responses: [
      {
        code: status,
        body: { mimeType, text },
      },
    ],
  });
});

const saveToSpec = async (newRestAPIArr: RestAPI[], target: string, project?: string) => {
  let apiJSON;
  let restApiArr = newRestAPIArr;
  if (project) {
    const config = await loadConfig();
    apiJSON = loadApiSync(join(config.raml, config.main));
    restApiArr = mergeRestApi(restApiArr, getRestApiArr(apiJSON));
  }
  const specStr = await toSpec(restApiArr, target);
  await appendFileAsync(target, specStr);
};

export const read = (har: string, filter?: string): RestAPI[] => {
  const json = JSON.parse(har);
  let entries = xhrFilter(json.log.entries);
  if (filter) {
    entries = filterPath(entries, filter);
  }
  return toRestAPI(entries);
};

export const save = async (restAPIArr: RestAPI[], target: string, project?: string) => {
  const ext = extname(target);
  if (ext === '.raml') {
    const ramlStr = await toRaml(restAPIArr);
    appendFileAsync(target, ramlStr);
    return ;
  }
  if (['.js', '.ts'].includes(ext)) {
    saveToSpec(restAPIArr, target, project);
  }
};
