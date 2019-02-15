
import { template } from 'lodash';
import RestAPI from '../models/rest-api';
import { indentString, readFileAsync } from '../util';

const toRaml = async (restAPIArr: RestAPI[]) => {
  const str = await readFileAsync(`${__dirname}/template/api.ejs`, 'utf-8');
  const compiled = template(str, { 'imports' : { 'indentString': indentString }});
  return compiled({ restAPIArr });
};

export default toRaml;
