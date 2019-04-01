import test from 'ava';
import path from 'path';
import fs from '@/util/fs';
import sinon from 'sinon';
import { read, mergeRestApiToSpec } from '@/har-convert';
import RestAPI from '@/models/rest-api';

test('Given a har file, then get xhr request arr', async (t) => {
  const restAPIs: RestAPI[] = [
    {
      url: '/api/test/raml/orders/T012019011828586',
      description: 'get_api_test_raml_orders_T012019011828586',
      method: 'GET',
      queryParameters: [{
        name: 'param1',
        example: ':hello:city:Beijing:model:',
      }],
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: '{"name":"你好"}',
          },
        },
      ],
    }, {
      url: '/api/test/raml/orders/T012019011828586/redeem',
      description: 'post_api_test_raml_orders_T012019011828586_redeem',
      method: 'POST',
      queryParameters: [],
      body: {
        mimeType: 'application/json;charset=UTF-8',
        text: '{"a":1,"b":2}',
      },
      responses: [{
        code: 200,
        body: {
          mimeType: 'application/json',
          text: '{}',
        },
      }],
    },
  ];
  const data = await fs.readFile(`${__dirname}/localhost.har`, 'utf8');
  const result = read(data);
  t.deepEqual(result, restAPIs);
});


test('Given a har file and use filter, When read Then get filter arr', async (t) => {
  const restAPIs: RestAPI[] = [
    {
      url: '/api/test/raml/orders/T012019011828586/redeem',
      description: 'post_api_test_raml_orders_T012019011828586_redeem',
      method: 'POST',
      queryParameters: [],
      body: {
        mimeType: 'application/json;charset=UTF-8',
        text: '{"a":1,"b":2}',
      },
      responses: [{
        code: 200,
        body: {
          mimeType: 'application/json',
          text: '{}',
        },
      }],
    },
  ];
  const data = await fs.readFile(`${__dirname}/localhost.har`, 'utf8');
  const result = read(data, '/orders/T012019011828586/redeem');
  t.deepEqual(result, restAPIs);
});


test.serial('Given restAPIs, When mergeRestApiToSpec Then got spec str', async (t) => {
  const restAPIs: RestAPI[] = [
    {
      url: '/api/test/raml/orders/T012019011828586',
      description: 'get_api_test_raml_orders_T012019011828586',
      method: 'GET',
      queryParameters: [{
        name: 'param1',
        example: 'value2',
      }],
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: '{"name":"你好"}',
          },
        },
      ],
    },
  ];

  const expectResult = `
const assert = require('assert');
const { loadApi } = require('@xbl/raml-mocker');

it('Case Name', async () => {
  const getFn0 = loadApi('get_api_test_raml_orders_T012019011828586');
  const { status: status0, data: data0 } = await getFn0({},{"param1":"value2"},{});

  assert.equal(status0, 200);
  // TODO: assert

});
`.trim();

  const template = await fs.readFile(path.resolve(__dirname, '../../src/har-convert/template/test.spec.ejs'));
  const callback = sinon.stub();
  callback.onCall(0).resolves(`
    {
      "controller": "./controller",
      "raml": "./test/har-convert",
      "main": "api.raml",
      "port": 3000,
      "runner": {
        "test": "http://localhost:3000"
      }
    }
  `);
  callback.onCall(1).resolves(template);
  sinon.replace(fs, 'readFile', callback);

  const result = await mergeRestApiToSpec(restAPIs);
  t.is(expectResult, result.trim());
  sinon.restore();
});
