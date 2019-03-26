import { readFile, appendFile } from 'fs';
import { promisify } from 'util';

export default {
  readFile: promisify(readFile),
  appendFile: promisify(appendFile),
};
