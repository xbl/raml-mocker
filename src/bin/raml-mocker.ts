#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { fork } from 'child_process';
import { loadConfig } from '../util';

const config = loadConfig(fs.readFileSync('./.raml-config.json', 'utf8'));
let server = null;
const startServer = () => {
  server = fork(path.join(__dirname, './server'));
  server.send(config);
};
const restartServer = () => {
  console.log('restart...');
  server.kill('SIGHUP');
  startServer();
};

startServer();

const watcher = chokidar.watch([config.raml, config.controller]);
watcher
  .on('change', restartServer)
  .on('unlinkDir', restartServer)
  .on('unlink', restartServer);
