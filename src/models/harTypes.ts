import Body from '@/models/body';

export interface HarEntry {
  request: { url: string; method: string; queryString: any[]; postData?: Body };
  response: { status: number; content: { mimeType: string; text: string}; redirectURL?: string};
}
export interface HarTyped {
  log: {entries: HarEntry[]};
}
