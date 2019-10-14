import test from 'ava';
import { getPathname } from '@/read-raml/utils';

test('Given has origin url When utils.getPathname() Then get pathname', (t) => {
  const expectedPathname = '/abc/123';
  const pathname =  getPathname('https://www.a.com/abc/123');
  t.is(pathname, expectedPathname);
});

test('Given has no origin url When utils.getPathname() Then get pathname', (t) => {
  const expectedPathname = '/abc/1234';
  const pathname = getPathname('/abc/1234');
  t.is(pathname, expectedPathname);
});

test('Given has no origin url And has {id} When utils.getPathname() Then get pathname', (t) => {
  const expectedPathname = '/abc/1234/{id}';
  const pathname = getPathname('/abc/1234/{id}');
  console.log(pathname);
  t.is(pathname, expectedPathname);
});


test('Given has origin url And has {id} When utils.getPathname() Then get pathname', (t) => {
  const expectedPathname = '/abc/1234/{id}';
  const pathname = getPathname('http://localhost/abc/1234/{id}');
  console.log(pathname);
  t.is(pathname, expectedPathname);
});
