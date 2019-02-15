import test from 'ava';
import toSpec from '../src/har-convert/to-spec';
import RestAPI from '../src/models/rest-api';

test('Given restAPI array, then get spec str', async t => {
  const restAPIArr: RestAPI[] = [
    {
      url: '/api/test/raml/orders/T012019011828586',
      description: 'get_api_test_raml_orders_T012019011828586',
      method: 'GET',
      queryParameter: {
        param1: 'value1'
      },
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: '{"name":"你好"}'
          }
        }
      ]
    }, {
      url: '/api/test/raml/orders/T012019011828586/redeem',
      description: 'post_api_test_raml_orders_T012019011828586_redeem',
      method: 'POST',
      queryParameter: {},
      body: {
        mimeType: 'application/json;charset=UTF-8',
        text: '{"a":1,"b":2}'
      },
      responses: [{
        code: 200,
        body: {
          mimeType: 'application/json',
          text: '{}'
        }
      }]
    }
  ];

  const expectResult = `
const assert = require('assert');
const { loadApi } = require('@xbl/raml-mocker');

it('abc.js', async () => {
  const getFn0 = loadApi('get_api_test_raml_orders_T012019011828586');
  const { status: status0, data: data0 } = await getFn0({},{"param1":"value1"},{});

  assert.equal(status0, 200);
  // TODO: assert

  const postFn1 = loadApi('post_api_test_raml_orders_T012019011828586_redeem');
  const { status: status1, data: data1 } = await postFn1({},{},{"a":1,"b":2});

  assert.equal(status1, 200);
  // TODO: assert

});
`.trim();
  const result = await toSpec(restAPIArr, '/a/b/d/abc.js');
  t.is(result.trim(), expectResult);
});


test('Given restAPI array and urlParameters, then get spec str', async t => {
  const restAPIArr: RestAPI[] = [
    {
      url: '/api/test/raml/orders/{id}',
      description: 'get_api_test_raml_orders_T012019011828586',
      method: 'GET',
      uriParameters: {
        id: 'T012019011828586'
      },
      queryParameter: {
        param1: 'value1'
      },
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: '{"name":"你好"}'
          }
        }
      ]
    }, {
      url: '/api/test/raml/orders/1234/redeem',
      description: 'post_api_test_raml_orders_T012019011828586_redeem',
      method: 'POST',
      queryParameter: {},
      body: {
        mimeType: 'application/json;charset=UTF-8',
        text: '{"a":1,"b":2}'
      },
      responses: [{
        code: 200,
        body: {
          mimeType: 'application/json',
          text: '{}'
        }
      }]
    }
  ];

  const expectResult = `
const assert = require('assert');
const { loadApi } = require('@xbl/raml-mocker');

it('abc.js', async () => {
  const getFn0 = loadApi('get_api_test_raml_orders_T012019011828586');
  const { status: status0, data: data0 } = await getFn0({"id":"T012019011828586"},{"param1":"value1"},{});

  assert.equal(status0, 200);
  // TODO: assert

  const postFn1 = loadApi('post_api_test_raml_orders_T012019011828586_redeem');
  const { status: status1, data: data1 } = await postFn1({},{},{"a":1,"b":2});

  assert.equal(status1, 200);
  // TODO: assert

});
`.trim();
  const result = await toSpec(restAPIArr, '/a/b/d/abc.js');
  t.is(result.trim(), expectResult);
});
