import Body from './body';
import Response from './response';
import Runner from './runner';

export default class RestAPI {
  url: string;
  method: string;
  description?: string;
  controller?: string;
  runner?: Runner;
  uriParameters?: object;
  queryParameter?: object;
  body?: Body;
  responses?: Response[];

}
