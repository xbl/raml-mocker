import test from 'ava';
import { jsonPath, replaceUriParameters, toExpressUri, indentString } from '../src/util';

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

test('When replaceUriParameters Given /products/{productId} Then get /products/:productId', t => {
  const given = '/products/{productId}';
  const exceptResult = '/products/:productId';
  let result = given;
  replaceUriParameters(given, (match, expression) => {
    result = result.replace(match, `:${expression}`);
  });
  t.is(result, exceptResult);
});

test('When toExpressUri Given /products/{productId} Then get /products/:productId', t => {
  const given = '/products/{productId}';
  const exceptResult = '/products/:productId';
  t.is(toExpressUri(given), exceptResult);
});

test('When indentString Given json str Then got format json', t => {
  const given = "{\n  \"realName\": \"王金金\",\n  \"mobile\": \"18217521607\",\n  \"avatar\": \"\",\n  \"nickName\": \"\",\n  \"born\": null,\n  \"gender\": \"MALE\",\n  \"email\": \"\",\n  \"address\": \"\",\n  \"occupation\": \"\",\n  \"interestedClasses\": [\"\"],\n  \"hobbies\": [\"\"],\n  \"ownModels\": [\"\"]\n}\n";
  const exceptResult = `
    {
      "realName": "王金金",
      "mobile": "18217521607",
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
  t.is(indentString(given, 4).trim(), exceptResult.trim());
});
