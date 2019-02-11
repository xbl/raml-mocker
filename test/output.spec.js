import test from 'ava';
import Output from '../src/output';

test('When message one line , then title is message', t => {
  const message = 'abc';
  const [, title] = Output.processMessage(message);
  t.is(title, message);
});

test('When message multiple line , then title is first line', t => {
  const expectTitle = 'the first line';
  const expectValidInfo = `and this is next line
  and this is last line`;
  const message = `${expectTitle}
${expectValidInfo}`;
  const [, title, validInfo] = Output.processMessage(message);
  t.is(title, expectTitle);
  t.is(validInfo, expectValidInfo);
});
