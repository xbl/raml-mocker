import test from 'ava';
import { readFileAsync } from '../src/util';
import { read } from '../src/har-convert';
import RestAPI from '../src/models/rest-api';

test('Given a har file, then get xhr request arr', async t => {
  const restAPIArr: RestAPI[] = [
    {
      url: '/api/test/raml/orders/T012019011828586',
      description: 'get_api_test_raml_orders_T012019011828586',
      method: 'GET',
      queryParameter: {
        param1: 'value1',
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
  const data = await readFileAsync(`${__dirname}/localhost.har`, 'utf8');
  const result = read(data);
  t.deepEqual(result, restAPIArr);
});
