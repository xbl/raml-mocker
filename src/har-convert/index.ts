import { extname, join } from 'path';
import { appendFile } from 'fs';
import { promisify } from 'util';
import xhrFilter from './xhr';
import urlUtil from 'url';
import RestAPI from '@/models/rest-api';
import toRaml from './to-raml';
import toSpec from './to-spec';
import { loadApi } from 'raml-1-parser';
import { loadConfig, mergeRestApi } from '@/util';
import { getRestApiArr } from '@/read-raml';
import filterPath from './filter-path';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import Parameter from '@/models/parameter';

const appendFileAsync = promisify(appendFile);

const filterEmpty = (obj) => JSON.parse(JSON.stringify(obj));

const toParameter = (queryStrings: any[]): Parameter[] =>
  queryStrings.map(({name, value}) => {
    return { name, example: decodeURIComponent(value)};
  });

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
    queryParameters: toParameter(queryString),
    body: postData,
    responses: [
      {
        code: status,
        body: { mimeType, text },
      },
    ],
  });
});

const saveToSpec = async (newRestAPIArr: RestAPI[], target: string) => {
  const config = await loadConfig();
  const apiJSON = await loadApi(join(config.raml, config.main)) as Api;
  const restApiArr = mergeRestApi(newRestAPIArr, getRestApiArr(apiJSON));
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

export const save = async (restAPIArr: RestAPI[], target: string) => {
  const ext = extname(target);
  if (ext === '.raml') {
    const ramlStr = await toRaml(restAPIArr);
    appendFileAsync(target, ramlStr);
    return ;
  }
  if (['.js', '.ts'].includes(ext)) {
    saveToSpec(restAPIArr, target);
  }
};
