#!/usr/bin/env node

import path from 'path';
import chokidar from 'chokidar';
import { fork, ChildProcess } from 'child_process';
import { loadConfig } from '@/util/config-util';

const start = async () => {
  const config = await loadConfig();
  let server: ChildProcess = null;
  const startServer = () => {
    server = fork(path.join(__dirname, './server'));
    server.send(config);
  };
  const restartServer = () => {
    // eslint-disable  no-console
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
};

void start();
