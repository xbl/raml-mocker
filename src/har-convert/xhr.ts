import { isJSONType } from '../util';

export default (entries: any[]): any[] =>
  entries
    .filter(({ response }) => {
      const { mimeType } = response.content;
      return isJSONType(mimeType);
    });
