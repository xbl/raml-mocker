import fs from 'fs';
import test from 'ava';
import convert from '../src/har-convert';

test.cb('Given a har file, then get xhr request arr', t => {
  fs.readFile(`${__dirname}/localhost.har`, 'utf8', (err, data) => {
    if (err) throw err;
    const xhrArr = [
      {
        url: '/api/test/raml/orders/T012019011828586',
        method: 'GET',
        queryString: [
          {
            name: 'param1',
            value: 'value1',
            comment: ''
          }
        ],
        response: {
          status: 200,
          content: {
            mimeType: 'application/json',
            text: '{"name":"你好"}'
          }
        }
      },
      {
        url: '/api/test/raml/orders/T012019011828586/redeem',
        method: 'POST',
        queryString: [],
        body: {
          mimeType: 'application/json;charset=UTF-8',
          text: '{"a":1,"b":2}'
        },
        response: {
          status: 200,
          content: {
            mimeType: 'application/json',
            text: '{}'
          }
        }
      }
    ];

    const result = convert(data);
    t.deepEqual(result, xhrArr);
    t.end();
  });
});
