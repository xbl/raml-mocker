const xhrFilter = require('./xhr');

export const read = har => {
  const json = JSON.parse(har);
  return xhrFilter(json);
};

export const save = () => {

};
