
import { template } from 'lodash';
import RestAPI from '../models/rest-api';
import { indentString, readFileAsync } from '../util';

const filter = (restApiArr) => {
  const map = {};
  return restApiArr.filter(restAPI => {
    return map[`${restAPI.method}_${restAPI.url} `] ? false : (map[`${restAPI.method}_${restAPI.url} `] = true);
  })
};

const toRaml = async (restAPIArr: RestAPI[]) => {
  const str = await readFileAsync(`${__dirname}/template/api.ejs`, 'utf-8');
  const compiled = template(str, { 'imports' : { 'indentString': indentString }});
  return compiled({ restAPIArr: filter(restAPIArr) });
};

export default toRaml;
