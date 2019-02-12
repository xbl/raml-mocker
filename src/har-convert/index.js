const xhrFilter = require('./xhr');

exports.read = har => {
  const json = JSON.parse(har);
  return xhrFilter(json);
};

exports.save = () => {

};
