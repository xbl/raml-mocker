import Body from './body';

export default class Response {
  code: number;
  body?: Body;
  redirectURL?: string;
}
