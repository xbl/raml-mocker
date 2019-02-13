import { readFile } from 'fs';
import { promisify } from 'util';
import { template } from 'lodash';
import RestAPI from '../models/rest-api';


const readFileAsync = promisify(readFile);
const toRaml = async (restAPIArr: RestAPI[]) => {
  const str = await readFileAsync(`${__dirname}/template/api.ejs`, 'utf-8');
  const compiled = template(str);
  return compiled({ restAPIArr }).trim();
};

export default toRaml;
