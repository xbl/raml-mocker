import test from 'ava';
import filterPath from '@/har-convert/filter-path';

test('Given entries, then get filter path entries', async (t) => {
  // tslint:disable:max-line-length
  const entries = [
    {
      request: {
        method: 'GET',
        url: 'http://abc.com/',
        queryString: [],
      },
      response: {
        status: 200,
        content: {
          mimeType: 'text/html',
          text:
            '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n    <meta name="viewport" content="width=device-width,initial-scale=1.0">\n    <link rel="icon" href="/favicon.ico">\n    <title>oneweb-ta</title>\n  <link href="/app.js" rel="preload" as="script"></head>\n  <body>\n    <noscript>\n      <strong>We\'re sorry but oneweb-ta doesn\'t work properly without JavaScript enabled. Please enable it to continue.</strong>\n    </noscript>\n    <div id="app"></div>\n    <!-- built files will be auto injected -->\n  <script type="text/javascript" src="/app.js"></script></body>\n</html>\n',
        },
        redirectURL: '',
      },
    },
    {
      request: {
        method: 'GET',
        url: 'http://localhost:8080/',
        queryString: [],
      },
      response: {
        status: 200,
        content: {
          mimeType: 'text/html',
          text:
            'hello one!',
        },
        redirectURL: '',
      },
    },
  ];

  const expectResult = [{
    request: {
      method: 'GET',
      url: 'http://localhost:8080/',
      queryString: [],
    },
    response: {
      status: 200,
      content: {
        mimeType: 'text/html',
        text:
          'hello one!',
      },
      redirectURL: '',
    },
  }];

  const data = filterPath(entries, 'localhost');
  t.deepEqual(data, expectResult);
});
