import test from 'ava';
import toRaml from '../src/har-convert/to-raml';
import RestAPI from '../src/models/rest-api';

test('Given restAPI array, then get raml str', async (t) => {
  const restAPIArr: RestAPI[] = [
    {
      url: '/api/test/raml/orders/T012019011828586',
      description: 'get_api_test_raml_orders_T012019011828586',
      method: 'GET',
      queryParameters: [{
        name: 'param1',
        example: 'value1',
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

  const expectResult = `
/api/test/raml/orders/T012019011828586:
  get:
    description: get_api_test_raml_orders_T012019011828586
    queryParameters:
      param1:
        example: value1
    responses:
      200:
        body:
          example: |
            {"name":"你好"}

/api/test/raml/orders/T012019011828586/redeem:
  post:
    description: post_api_test_raml_orders_T012019011828586_redeem
    body:
      example: |
        {"a":1,"b":2}
    responses:
      200:
        body:
          example: |
            {}
`.trim();
  const result = await toRaml(restAPIArr);
  t.is(result.trim(), expectResult);
});

test('Given restAPI duplicate array, then get raml str', async (t) => {
  const restAPIArr: RestAPI[] = [
    {
      url: '/api/test/raml/orders/T012019011828586',
      description: 'get_api_test_raml_orders_T012019011828586',
      method: 'GET',
      queryParameters: [{
        name: 'param1',
        example: 'value1',
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

  const expectResult = `
/api/test/raml/orders/T012019011828586:
  get:
    description: get_api_test_raml_orders_T012019011828586
    queryParameters:
      param1:
        example: value1
    responses:
      200:
        body:
          example: |
            {"name":"你好"}

/api/test/raml/orders/T012019011828586/redeem:
  post:
    description: post_api_test_raml_orders_T012019011828586_redeem
    body:
      example: |
        {"a":1,"b":2}
    responses:
      200:
        body:
          example: |
            {}
`.trim();
  const result = await toRaml(restAPIArr);
  t.is(result.trim(), expectResult);
});
