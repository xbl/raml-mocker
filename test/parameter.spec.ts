import test from 'ava';
import Parameter from '@/models/parameter';

test('When Parameter.build, Give json object, Then get Parameter Array', (t) => {
  const json = {
    a: 1,
    b: 2,
  };
  const expectResult: Parameter[] = [{
    name: 'a',
    example: 1,
  }, {
    name: 'b',
    example: 2,
  }];
  const result = Parameter.build(json);
  t.deepEqual(result, expectResult);
});

test('When Parameter.toJSON, Give get Parameter Array, Then json object', (t) => {
  const expectJson = {
    a: 1,
    b: 2,
  };
  const arr: Parameter[] = [{
    name: 'a',
    example: 1,
  }, {
    name: 'b',
    example: 2,
  }];
  const result = Parameter.toJSON(arr);
  t.deepEqual(result, expectJson);
});
