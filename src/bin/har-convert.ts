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
const project = argsMap['-p'];
const filter = argsMap['-filter'];

const convert = async () => {
  if (!harPath || !target) {
    // tslint:disable no-console
    console.log('请指定 -f 入口文件及 -o 输出文件');
    return;
  }
  const har = await readFileAsync(harPath, 'utf-8');
  const restAPIArr = read(har, filter);
  save(restAPIArr, target, project);
};

convert();
