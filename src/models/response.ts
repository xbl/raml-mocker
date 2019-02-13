import Body from './body';
import Schema from './schema';

export default class Response {
  code: number;
  body?: Body;
  redirectURL?: string;
  schema?: Schema;
}
