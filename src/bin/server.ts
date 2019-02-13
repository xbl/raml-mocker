#!/usr/bin/env node

import http from 'http';
import mocker from '../server';

process.on('message', config => {
  mocker.setConfig(config);
  const port = config.port || 3000;
  http
    .createServer(mocker.app)
    .listen(port, () =>
      console.log(`raml mock server http://localhost:${port}!`)
    );
});
