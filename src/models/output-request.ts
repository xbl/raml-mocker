export default class OutputRequest {
  path: string;
  method: string;
  beginTime: any;

  constructor(obj: {path?: string, method?: string}) {
    this.path = obj.path;
    this.method = obj.method;
    this.beginTime = Date.now();
  }

  setRealPath(realPath: string) {
    if (realPath) {
      this.path = realPath;
    }
  }
}
