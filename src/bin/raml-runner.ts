#!/usr/bin/env node

import { loadConfig } from '../util';
import runner from '../runner';

const start = async () => {
  const config = await loadConfig();
  runner(config);
};

start();
