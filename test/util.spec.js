import test from 'ava';
import { jsonPath, replaceUriParmaters } from '../src/util';

test('When json object Give dataPath [0] str Then get json[0] object', t => {
  const exceptResult = {
    a: 1,
    b: 2
  };
  const json = [exceptResult];
  const dataPath = '[0]';
  const result = jsonPath(json, dataPath);
  t.deepEqual(result, exceptResult);
});

test('When uri Given /products/{productId} Then get /products/:productId', t=> {
  const given = '/products/{productId}';
  const exceptResult = '/products/:productId';
  let result = given;
  replaceUriParmaters(given, (match, expression) => {
    result = result.replace(match, `:${expression}`);
  });
  t.is(result, exceptResult);
});
