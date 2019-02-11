const urlUtil = require('url');

const isXHR = mimeType => /\/json/.test(mimeType);

module.exports = har =>
  har.log.entries
    .filter(({ response }) => {
      const { mimeType } = response.content;
      return isXHR(mimeType);
    })
    .map(entry => {
      const { request } = entry;
      const { url, method } = request;
      const newUrl = urlUtil.parse(url);
      return {
        url: newUrl.pathname,
        method
      };
    });
