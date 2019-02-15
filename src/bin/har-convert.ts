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

const convert​​ = async () => {
  const har = await readFileAsync(harPath, 'utf-8');
  const RestAPIArr = read(har);
  save(RestAPIArr, target);
}

convert​​();
