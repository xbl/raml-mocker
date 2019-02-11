const xhrFilter = require('./xhr');

module.exports = har => {
  const json = JSON.parse(har);
  return xhrFilter(json);
};
