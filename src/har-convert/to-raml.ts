/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { template } from 'lodash';
import fs from '@/util/fs';
import RestAPI from '@/models/rest-api';
import { indentString, isJSONType } from '@/util';

const filter = (restAPIs: RestAPI[]) => {
  const map = {};
  return restAPIs.filter((restAPI) => {
    const key = `${restAPI.method}_${restAPI.url}`;
    return map[key] ? false : (map[key] = true);
  });
};

const toRaml = async (restAPIs: RestAPI[]): Promise<string> => {
  const str = await fs.readFile(`${__dirname}/template/api.ejs`, 'utf-8');
  const compiled = template(str, { imports : { indentString, isJSONType }});
  return compiled({ restAPIArr: filter(restAPIs) }).trim();
};

export default toRaml;
