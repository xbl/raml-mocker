const urlUtil = require('url');

const isXHR = mimeType => /\/json/.test(mimeType);

const filterEmpty = obj => JSON.parse(JSON.stringify(obj));

module.exports = har =>
  har.log.entries
    .filter(({ response }) => {
      const { mimeType } = response.content;
      return isXHR(mimeType);
    })
    .map(entry => {
      const { request, response } = entry;
      const { url, method, queryString, postData } = request;
      const newUrl = urlUtil.parse(url);

      const {
        status,
        content: { mimeType, text }
      } = response;
      return filterEmpty({
        url: newUrl.pathname,
        method,
        queryString,
        body: postData,
        response: {
          status,
          content: {
            mimeType,
            text
          }
        }
      });
    });
