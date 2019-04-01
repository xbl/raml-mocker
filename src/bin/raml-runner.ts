#!/usr/bin/env node

import { getHost } from '@/util';
import { loadConfig } from '@/util/config-util';
import runner from '@/runner';
import Output from '@/output';

const start = async () => {
  const config = await loadConfig();
  const host = getHost(config);
  const output = new Output(host);
  process.on('beforeExit', () => {
    output.print();
  });

  runner(config, output, host);
};

start();
