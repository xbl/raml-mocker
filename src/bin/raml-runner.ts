#!/usr/bin/env node

import { loadConfig } from '../util';
import runner from '../runner';
import Output from '../output';

const start = async () => {
  const config = await loadConfig();
  const env = process.env.NODE_ENV;
  let host = `http://localhost:${config.port}`;
  if (config.runner && env) {
    host = config.runner[env];
  }
  const output = new Output(host);
  process.on('beforeExit', () => {
    output.print();
  });

  runner(config, output, host);
};

start();
