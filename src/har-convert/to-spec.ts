import { basename } from 'path';
import { template } from 'lodash';
import RestAPI from '../models/rest-api';
import { isJSONType, readFileAsync } from '../util';

const toSpec = async (restAPIArr: RestAPI[], name: string) => {
  const str = await readFileAsync(`${__dirname}/template/test.spec.ejs`, 'utf-8');
  const compiled = template(str, { 'imports' : { isJSONType }});
  return compiled({ restAPIArr, name: basename(name) });
};

export default toSpec;
