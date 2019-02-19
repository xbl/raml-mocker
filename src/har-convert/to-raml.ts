
import { template } from 'lodash';
import RestAPI from '../models/rest-api';
import { indentString, readFileAsync, isJSONType } from '../util';

const filter = (restApiArr) => {
  const map = {};
  return restApiArr.filter((restAPI) => {
    const key = `${restAPI.method}_${restAPI.url}`;
    return map[key] ? false : (map[key] = true);
  });
};

const toRaml = async (restAPIArr: RestAPI[]) => {
  const str = await readFileAsync(`${__dirname}/template/api.ejs`, 'utf-8');
  const compiled = template(str, { imports : { indentString, isJSONType }});
  return compiled({ restAPIArr: filter(restAPIArr) });
};

export default toRaml;
