import xhrFilter from './xhr';
import urlUtil from 'url';
import RestAPI from '../models/rest-api';

const filterEmpty = obj => JSON.parse(JSON.stringify(obj));

const toParameter = (queryStrings) =>
  queryStrings.reduce((accumulator, {name, value}) => {
    return Object.assign(accumulator, {[name]: value})
  }, {});

export const read = (har): RestAPI[] => {
  const json = JSON.parse(har);
  const entries = xhrFilter(json.log.entries);

  return entries.map(entry => {
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
};

export const save = (restAPIArr: RestAPI[]) => {

};
