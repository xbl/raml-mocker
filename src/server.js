const express = require('express');

const app = express();
const { isRedirectCode } = require('./util');
const readRaml = require('./read_raml');

app.use((req, res, next) => {
  // eslint-disable-next-line
  console.log('PATH: %s, METHOD: %s', req.path, req.method);
  next();
});

const handler = (req, res, config, webApi) => {
  if (webApi.controller) {
    const controller = webApi.controller.split('#');
    // eslint-disable-next-line
    const moduleCtrl = require(`${config.controller}/${controller[0]}`);
    const fn = moduleCtrl[controller[1]];
    if (typeof fn === 'function') fn.call(app, req, res, webApi);
    return;
  }

  const response = webApi.responses[0];
  if (!response) {
    res.status(404).send('no set reponse or example');
    return;
  }

  if (isRedirectCode(response.code)) {
    res.redirect(response.location);
    return;
  }

  if (response.mimeType) res.type(response.mimeType);
  res.status(response.code);
  let { body } = response;
  if (!body) return;
  if (Array.isArray(config.plugins)) {
    config.plugins.forEach(plugin => {
      // eslint-disable-next-line
      body = require(plugin)(body);
    });
  }
  res.send(body);
};

exports.setConfig = config => {
  const webApiArr = readRaml.load(config);
  webApiArr.forEach(webApi => {
    app[webApi.method](webApi.absoluteUri, (req, res) => {
      handler(req, res, config, webApi);
    });
  });
};

exports.app = app;
