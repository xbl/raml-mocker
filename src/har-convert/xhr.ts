import { isJSONType } from '../util';
import { HarEntry } from '@/models/harTypes';

export default (entries: HarEntry[]): any[] =>
  entries
    .filter(({ response }) => {
      const { mimeType } = response.content;
      return isJSONType(mimeType);
    });
