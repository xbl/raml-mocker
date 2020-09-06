#!/usr/bin/env node

import fs from '@/util/fs';
import { read, save } from '../har-convert';

const argsMap = {};
const args = process.argv.splice(2);
args.forEach((val, index) => {
  if (index % 2 === 0) {
    argsMap[val] = args[index + 1];
  }
});

const harPath: string = argsMap['-f'] as string;
const target = argsMap['-o'] as string;
const filter = argsMap['-filter'] as string;

const convert = async () => {
  if (!harPath || !target) {
    // eslint-disable  no-console
    console.log(`
  har 转 raml:
  har-convert -f ./[har 文件].har -o ./raml/[目标].raml -filter /api/v1

  har 转 *.spec.js:
  har-convert -f ./[har 文件].har -o ./test/[目标].spec.js

  Options:

  -f         入口文件
  -o         输出文件
  -filter    只过滤带有过滤条件的请求（可选），如: -filter /api/v1
`);
    return;
  }
  const har = await fs.readFile(harPath, 'utf-8');
  const restAPIArr = read(har, filter);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  save(restAPIArr, target);
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
convert();
