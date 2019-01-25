const { join } = require('path');
const express = require('express');
const raml = require('raml-1-parser');

const app = express();
const readRaml = require('./read_raml');
const { isRedirectCode, toExpressUri } = require('./util');

app.use((req, res, next) => {
  // eslint-disable-next-line
  console.log('PATH: %s, METHOD: %s', req.path, req.method);
  next();
});

const handler = (req, res, config, webApi) => {
  if (webApi.controller) {
    const [controller, methodName] = webApi.controller.split('#');
    // eslint-disable-next-line
    const moduleCtrl = require(`${config.controller}/${controller}`);
    const fn = moduleCtrl[methodName];
    if (typeof fn === 'function') fn.call(app, req, res, webApi);
    return;
  }

  const response = webApi.responses[0];
  if (!response) {
    res.status(404).send('no set response or example');
    return;
  }

  if (isRedirectCode(response.code)) {
    res.redirect(response.location);
    return;
  }

  if (response.mimeType) res.type(response.mimeType);
  res.status(response.code);
  let { body } = response;
  if (body === undefined || body === null) return;
  if (Array.isArray(config.plugins)) {
    config.plugins.forEach(plugin => {
      // eslint-disable-next-line
      body = require(plugin)(body);
    });
  }
  res.send(body);
};

exports.setConfig = config => {
  const apiJSON = raml.loadApiSync(join(config.raml, config.main), {
    serializeMetadata: false
  });

  const webApiArr = readRaml.getWebApiArr(apiJSON);
  webApiArr.forEach(webApi => {
    app[webApi.method](toExpressUri(webApi.absoluteUri), (req, res) => {
      handler(req, res, config, webApi);
    });
  });
};

exports.app = app;
