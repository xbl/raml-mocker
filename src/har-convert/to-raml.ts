
import { template } from 'lodash';
import fs from '@/util/fs';
import RestAPI from '@/models/rest-api';
import { indentString, isJSONType } from '@/util';

const filter = (restApiArr) => {
  const map = {};
  return restApiArr.filter((restAPI) => {
    const key = `${restAPI.method}_${restAPI.url}`;
    return map[key] ? false : (map[key] = true);
  });
};

const toRaml = async (restAPIArr: RestAPI[]): Promise<string> => {
  const str = await fs.readFile(`${__dirname}/template/api.ejs`, 'utf-8');
  const compiled = template(str, { imports : { indentString, isJSONType }});
  return compiled({ restAPIArr: filter(restAPIArr) }).trim();
};

export default toRaml;
