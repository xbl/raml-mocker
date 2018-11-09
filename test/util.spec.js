import test from 'ava';
import { jsonPath } from '../src/util';

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
