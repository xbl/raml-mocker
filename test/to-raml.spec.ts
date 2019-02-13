import test from 'ava';
import toRaml from '../src/har-convert/to-raml';
import RestAPI from '../src/models/rest-api';

test('Given restAPI array, then get raml str', async t => {
  const restAPIArr: RestAPI[] = [
    {
      url: '/api/test/raml/orders/T012019011828586',
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
    }
  ];

  const expectResult = `
/api/test/raml/orders/T012019011828586:
  get:
    description: 商品列表
    queryParameters:
      param1:
        example: value1
    responses:
      200:
        body:
          example: |
            {"name":"你好"}`.trim();
  const result = await toRaml(restAPIArr);
  t.is(result, expectResult);
});
