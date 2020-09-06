#!/usr/bin/env node

import { getHost } from '@/util';
import { loadConfig } from '@/util/config-util';
import Runner from '@/runner';
import Output from '@/output';

const start = async () => {
  const config = await loadConfig();
  const host = getHost(config);
  const output = new Output(host);
  process.on('beforeExit', () => {
    output.print();
  });

  const runner = new Runner(config, output);
  void runner.start();
};

void start();
