import { readFile } from 'fs';
import { promisify } from 'util';
import { template } from 'lodash';
import RestAPI from '../models/rest-api';
import { indentString } from '../util';

const readFileAsync = promisify(readFile);
const toRaml = async (restAPIArr: RestAPI[]) => {
  const str = await readFileAsync(`${__dirname}/template/api.ejs`, 'utf-8');
  const compiled = template(str, { 'imports' : { 'indentString': indentString }});
  return compiled({ restAPIArr });
};

export default toRaml;
