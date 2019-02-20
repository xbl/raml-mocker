import Body from './body';
import Response from './response';
import Runner from './runner';
import Parameter from './parameter';

export default class RestAPI {
  url: string;
  method: string;
  description?: string;
  controller?: string;
  runner?: Runner;
  uriParameters?: object;
  queryParameters?: Parameter[];
  body?: Body;
  responses?: Response[];

}
