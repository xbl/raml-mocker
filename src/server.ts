import { join } from 'path';
import express from 'express';
import { getRestApiArr } from './read-raml';
import { isRedirectCode, toExpressUri } from './util';
import RestAPI from './models/rest-api';
import { loadApiSync } from 'raml-1-parser';

const app = express();

app.use((req, res, next) => {
  // eslint-disable-next-line
  console.log('PATH: %s, METHOD: %s', req.path, req.method);
  next();
});

const handler = (req, res, config, webApi: RestAPI) => {
  if (webApi.controller) {
    const [controller, methodName] = webApi.controller.split('#');
    // eslint-disable-next-line
    const moduleCtrl = require(`${config.controller}/${controller}`);
    const fn = moduleCtrl[methodName];
    if (typeof fn === 'function') { fn.call(app, req, res, webApi); }
    return;
  }

  const response = webApi.responses[0];
  if (!response) {
    res.status(404).send('no set response or example');
    return;
  }

  if (isRedirectCode(response.code)) {
    res.redirect(response.redirectURL);
    return;
  }

  const { body } = response;
  if (body.mimeType) { res.type(body.mimeType); }
  res.status(response.code);
  if (Array.isArray(config.plugins)) {
    config.plugins.forEach((plugin) => {
      // eslint-disable-next-line
      const text = require(plugin)(body);
      res.send(text);
    });
    return;
  }
  res.send(body.text);
};

const setConfig = (config) => {
  const apiJSON = loadApiSync(join(config.raml, config.main));

  const webApiArr = getRestApiArr(apiJSON);
  webApiArr.forEach((webApi) => {
    app[webApi.method](toExpressUri(webApi.url), (req, res) => {
      handler(req, res, config, webApi);
    });
  });
};

export default {
  setConfig,
  app,
};
