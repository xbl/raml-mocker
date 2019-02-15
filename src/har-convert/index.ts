import { extname } from 'path';
import { appendFile } from 'fs';
import { promisify } from 'util';
import xhrFilter from './xhr';
import urlUtil from 'url';
import RestAPI from '../models/rest-api';
import toRaml from './to-raml';

const appendFileAsync = promisify(appendFile);

const filterEmpty = obj => JSON.parse(JSON.stringify(obj));

const toParameter = (queryStrings: any[]) =>
  queryStrings.reduce((accumulator, {name, value}) => {
    return Object.assign(accumulator, {[name]: value})
  }, {});

const toRestAPI = (entries: any[]) => entries.map(entry => {
  const { request, response } = entry;
  const { url, method, queryString, postData } = request;
  const newUrl = urlUtil.parse(url);

  const {
    status,
    content: { mimeType, text }
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
        body: { mimeType, text }
      }
    ]
  });
});

export const read = (har: string): RestAPI[] => {
  const json = JSON.parse(har);
  const entries = xhrFilter(json.log.entries);
  return toRestAPI(entries);
};

export const save = async (restAPIArr: RestAPI[], target: string) => {
  const ramlStr = await toRaml(restAPIArr);
  if (extname(target) === '.raml') {
    await appendFileAsync(target, ramlStr);
  }
};
