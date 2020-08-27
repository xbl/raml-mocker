import { template } from 'lodash';
import { isJSONType } from '@/util';
import fs from '@/util/fs';
import RestAPI from '@/models/rest-api';
import Parameter from '@/models/parameter';

const SPEC_TEMPLATE = `${__dirname}/template/test.spec.ejs`;

const toSpec = async (restAPIArr: RestAPI[]) => {
  const str = await fs.readFile(SPEC_TEMPLATE, 'utf-8');
  const compiled = template(str, { imports : { isJSONType, Parameter }});
  return compiled({ restAPIArr}).trim();
};

export default toSpec;
