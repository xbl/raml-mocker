import fs from 'fs';
import test from 'ava';
import convert from '../src/har-convert';

test.cb('Given a har file, then get xhr request arr', t => {
  fs.readFile(`${__dirname}/localhost.har`, 'utf8', (err, data) => {
    if (err) throw err;
    const xhrArr = [
      {
        url: '/api/test/raml/orders/T012019011828586',
        method: 'GET'
      },
      {
        url: '/api/test/raml/orders/T012019011828586/redeem',
        method: 'POST'
      }
    ];

    const result = convert(data);
    t.deepEqual(result, xhrArr);
    t.end();
  });
});
