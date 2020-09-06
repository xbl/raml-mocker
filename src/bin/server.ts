#!/usr/bin/env node

import http from 'http';
import mocker from '../server';
import Config from '@/models/config';

process.on('message', (config: Config) => {
  mocker.setConfig(config);
  const port = config.port || 3000;
  // eslint-disable  no-console
  http
    .createServer(mocker.app)
    .listen(port, () =>
      console.log(`raml mock server http://localhost:${port}!`),
    );
});
