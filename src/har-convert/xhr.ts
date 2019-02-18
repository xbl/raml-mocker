import { isJSONType } from '../util';

export default (entries) =>
  entries
    .filter(({ response }) => {
      const { mimeType } = response.content;
      return isJSONType(mimeType);
    });
