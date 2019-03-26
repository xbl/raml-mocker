import test from 'ava';
import RestAPI from '../src/models/rest-api';
import { jsonPath, replaceUriParameters, toExpressUri,
  indentString, mergeRestApi, urlCompare, getHost } from '../src/util';
import Config from '../src/models/config';

test('Given json object When dataPath [0] str Then get json[0] object', (t) => {
  const expectResult = {
    a: 1,
    b: 2,
  };
  const json = [expectResult];
  const dataPath = '[0]';
  const result = jsonPath(json, dataPath);
  t.deepEqual(result, expectResult);
});

test('Given /products/{productId} When replaceUriParameters Then get /products/:productId', (t) => {
  const given = '/products/{productId}';
  const expectResult = '/products/:productId';
  let result = given;
  replaceUriParameters(given, (match, expression) => {
    result = result.replace(match, `:${expression}`);
  });
  t.is(result, expectResult);
});

test('Given /products/{productId} When toExpressUri Then get /products/:productId', (t) => {
  const given = '/products/{productId}';
  const expectResult = '/products/:productId';
  t.is(toExpressUri(given), expectResult);
});

test('Given json str When indentString Then got format json', (t) => {
  // tslint:disable:max-line-length
  const given = '{\n  "realName": "金金",\n  "mobile": "15811111111",\n  "avatar": "",\n  "nickName": "",\n  "born": null,\n  "gender": "MALE",\n  "email": "",\n  "address": "",\n  "occupation": "",\n  "interestedClasses": [""],\n  "hobbies": [""],\n  "ownModels": [""]\n}\n';
  const expectResult = `
    {
      "realName": "金金",
      "mobile": "15811111111",
      "avatar": "",
      "nickName": "",
      "born": null,
      "gender": "MALE",
      "email": "",
      "address": "",
      "occupation": "",
      "interestedClasses": [""],
      "hobbies": [""],
      "ownModels": [""]
    }`;
  t.is(indentString(given, 4).trim(), expectResult.trim());
});

test('Given newRestApi and oldRestApi When mergeRestApi Then get newRestApi ', (t) => {
  const newRestApi: RestAPI[] = [
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

  const oldRestApi: RestAPI[] = [
    {
      url: '/api/test/raml/orders/{id}',
      description: '获得',
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
      url: '/api/test/raml/orders/{id}/redeem',
      description: '保存',
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

  const expectResult: RestAPI[] = [
    {
      url: '/api/test/raml/orders/{id}',
      description: '获得',
      method: 'GET',
      uriParameters: {
        id: 'T012019011828586',
      },
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
      url: '/api/test/raml/orders/{id}/redeem',
      description: '保存',
      method: 'POST',
      uriParameters: {
        id: 'T012019011828586',
      },
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
  t.deepEqual(mergeRestApi(newRestApi, oldRestApi), expectResult);
});


test('Given a url and raml url When urlCompare Then get uriMap', (t) => {
  const uriMap = urlCompare('/abc/def/hello/jack', '/abc/{id}/hello/{name}');
  const expectResult = {
    id: 'def',
    name: 'jack',
  };
  t.deepEqual(expectResult, uriMap);
});

test('Given a url and raml url When urlCompare Then get null', (t) => {
  const uriMap = urlCompare('/abc', '/abc/{id}/hello/{name}');
  const expectResult = undefined;
  t.is(expectResult, uriMap);
});

test('Given Config When getHost Then get http://localhost', (t) => {
  const config: Config​​ = {
    controller: '',
    raml: '',
    main: '',
    port: 3000,
    runner: {
      dev: 'http://localhost',
      test: 'http://127.0.0.1',
    },
  };

  process.env.NODE_ENV = 'dev';
  const host = getHost(config);
  const expectResult = 'http://localhost';
  t.is(host, expectResult);
});

test('Given Config has no runner NODE_ENV is dev1 When getHost Then got Error', (t) => {
  const config: Config​​ = {
    controller: '',
    raml: '',
    main: '',
    port: 3000,
    runner: {
      dev: 'http://localhost',
      test: 'http://127.0.0.1',
    },
  };

  process.env.NODE_ENV = 'dev1';
  const error = t.throws(() => {
    getHost(config);
  });
  t.truthy(error.message);
});
