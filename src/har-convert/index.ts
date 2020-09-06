import urlUtil from 'url';
import fs from '@/util/fs';
import xhrFilter from './xhr';
import toRaml from './to-raml';
import toSpec from './to-spec';
import { extname, join } from 'path';
import filterPath from './filter-path';
import RestAPI from '@/models/rest-api';
import { loadApi } from 'raml-1-parser';
import { getRestApiArr } from '@/read-raml';
import Parameter from '@/models/parameter';
import { mergeRestApi } from '@/util';
import { loadConfig } from '@/util/config-util';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { HarEntry, HarTyped } from '@/models/harTypes';


const filterEmpty = (obj: any): RestAPI => JSON.parse(JSON.stringify(obj)) as RestAPI;

const toParameter = (queryStrings: any[]): Parameter[] =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  queryStrings.map(({name, value}) => ({ name, example: decodeURIComponent(value)}));

const toRestAPI = (entries: any[]): RestAPI[] => entries.map((entry: HarEntry) => {
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

export const mergeRestApiToSpec = async (newRestAPIArr: RestAPI[]): Promise<string> => {
  const config = await loadConfig();
  const apiJSON = await loadApi(join(config.raml, config.main)) as Api;
  const restApiArr = mergeRestApi(newRestAPIArr, getRestApiArr(apiJSON));
  return toSpec(restApiArr);
};

export const read = (har: string, filter?: string): RestAPI[] => {
  const json: HarTyped = JSON.parse(har) as HarTyped;
  let entries = xhrFilter(json.log.entries);
  if (filter) {
    entries = filterPath(entries, filter);
  }
  return toRestAPI(entries);
};

export const save = async (restAPIArr: RestAPI[], target: string): Promise<void> => {
  const ext = extname(target);
  let str = '';
  if (isRamlFile(ext)) {
    str = await toRaml(restAPIArr);
  }
  if (isScriptFile(ext)) {
    str = await mergeRestApiToSpec(restAPIArr);
  }
  return fs.appendFile(target, str);
};

const isScriptFile = (ext: string) => ['.js', '.ts'].includes(ext);

const isRamlFile = (ext: string) => ext === '.raml';
