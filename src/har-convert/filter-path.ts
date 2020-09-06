import { HarEntry } from '@/models/harTypes';

export default (entries: HarEntry[], condition: string): any[] =>
  entries
    .filter(({ request }) => {
      const { url } = request;
      return url.includes(condition);
    });
