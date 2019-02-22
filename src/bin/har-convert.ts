#!/usr/bin/env node

import { readFileAsync } from '../util';
import { read, save } from '../har-convert';

const argsMap = {};
const args = process.argv.splice(2);
args.forEach((val, index) => {
  if (index % 2 === 0) {
    argsMap[val] = args[index + 1];
  }
});

const harPath = argsMap['-f'];
const target = argsMap['-o'];
const filter = argsMap['-filter'];

const convert = async () => {
  if (!harPath || !target) {
    // tslint:disable no-console
    console.log(`
  har 转 raml:
  har-convert -f ./[har 文件].har -o ./api/[目标].raml -filter /api/v1

  har 转 *.spec.js:
  har-convert -f ./[har 文件].har -o ./test/[目标].spec.js

  Options:

  -f         入口文件
  -o         输出文件
  -filter    只过滤带有过滤条件的请求（可选），如: -filter /api/v1
`);
    return;
  }
  const har = await readFileAsync(harPath, 'utf-8');
  const restAPIArr = read(har, filter);
  save(restAPIArr, target);
};

convert();
