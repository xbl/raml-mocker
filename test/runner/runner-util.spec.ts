import test from 'ava';
import { getResponseByStatusCode, sortByRunner } from '../../src/runner/runner-util';
import Response from '../../src/models/response';
import RestAPI from '../../src/models/rest-api';

test('When getResponseByStatusCode, Given Response Array, Then get a Response', async (t) => {
  const respArr: Response[] = [
    {
      code: 200,
      redirectURL: 'http://abc.com',
    },
    {
      code: 302,
      redirectURL: 'http://def.com',
    },
  ];

  const expectResult = {
    code: 200,
    redirectURL: 'http://abc.com',
  };
  const result = getResponseByStatusCode(200, respArr);
  t.deepEqual(result, expectResult);
});

test('When getResponseByStatusCode, Given Response Array, Then get undefined', async (t) => {
  const respArr: Response[] = [
    {
      code: 200,
      redirectURL: 'http://abc.com',
    },
    {
      code: 302,
      redirectURL: 'http://def.com',
    },
  ];

  const expectResult = undefined;
  const result = getResponseByStatusCode(400, respArr);
  t.deepEqual(result, expectResult);
});

test('When getResponseByStatusCode, Given empty Response Array, Then get undefined', async (t) => {
  const respArr: Response[] = undefined;

  const expectResult = undefined;
  const result = getResponseByStatusCode(400, respArr);
  t.deepEqual(result, expectResult);
});

test('When sortByRunner, Given RestApi Array, Then get sort by runner', async (t) => {
  const restApiArr: RestAPI[] = [
    {
      url: 'https://abc.com',
      method: 'get',
    },
    {
      url: 'https://def.com',
      method: 'post',
      runner​​: {
        after: 'after.js',
      },
    },
  ];

  const expectResult: RestAPI[] = [
    {
      url: 'https://def.com',
      method: 'post',
      runner​​: {
        after: 'after.js',
      },
    },
    {
      url: 'https://abc.com',
      method: 'get',
    },
  ];
  const result = sortByRunner(restApiArr);
  t.deepEqual(result, expectResult);
});


test('When sortByRunner, Given RestApi undefined Array, Then get undefined', async (t) => {
  const restApiArr: RestAPI[] = undefined;

  const expectResult: RestAPI[] = undefined;
  const result = sortByRunner(restApiArr);
  t.deepEqual(result, expectResult);
});
