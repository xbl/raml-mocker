export default class OutputRequest {
  path: string;
  method: string;
  beginTime: any;

  constructor(obj: {path?: string, method?: string, beginTime?: any}) {
    this.path = obj.path;
    this.method = obj.method;
    this.beginTime = obj.beginTime;
  }

  setRealPath(realPath: string) {
    if (realPath) {
      this.path = realPath;
    }
  }
}
