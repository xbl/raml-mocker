import test from 'ava';
import sinon from 'sinon';
import fs from '@/util/fs';
import Config from '@/models/config';
import { loadConfig } from '@/util/config-util';

test.serial('Given When loadConfig Then got Config object', async (t) => {
  sinon.replace(fs, 'readFile', sinon.fake.resolves(`
    {
      "controller": "./controller",
      "raml": "./raml",
      "main": "api.raml",
      "port": 3000,
      "runner": {
        "test": "http://localhost:3000",
        "dev": "http://abc.com:3001"
      },
      "plugins": ["1.js"]
    }
  `));

  sinon.replace(process, 'cwd', sinon.fake.returns('/Users/'));

  const expectResult: Config = {
    controller: '/Users/controller',
    raml: '/Users/raml',
    main: 'api.raml',
    port: 3000,
    runner: {
      test: 'http://localhost:3000',
      dev: 'http://abc.com:3001',
    },
    plugins: ['/Users/1.js'],
  };

  const config​​ = await loadConfig();
  t.deepEqual(expectResult, config);
  sinon.restore();
});

test.serial('Given When loadConfig Then got no file Error', async (t) => {
  const expectResult = '在当前目录';
  sinon.replace(fs, 'readFile', sinon.fake.rejects(new Error(expectResult)));
  sinon.replace(process, 'exit', sinon.fake.returns(''));

  const error = await t.throwsAsync(loadConfig());
  t.truthy(error.message.includes(expectResult));
  sinon.restore();
});

test.serial('Given When loadConfig Then got json Error', async (t) => {
  sinon.replace(fs, 'readFile', sinon.fake.resolves(`
    {ddd}
  `));
  sinon.replace(process, 'exit', sinon.fake.returns(''));

  const error = await t.throwsAsync(loadConfig());
  t.truthy(error.message);
  sinon.restore();
});
