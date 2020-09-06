import { join } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { getRestApiArr } from './read-raml';
import { isRedirectCode, toExpressUri } from './util';
import RestAPI from './models/rest-api';
import { loadApiSync } from 'raml-1-parser';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text({type: '*/*'}));

app.use((req, res, next) => {
  // eslint-disable  no-console
  console.log('PATH: %s, METHOD: %s', req.path, req.method);
  next();
});

const handler = (req, res, config, restApi: RestAPI) => {
  if (restApi.controller) {
    const [controller, methodName] = restApi.controller.split('#');
    const moduleCtrl = require(`${config.controller}/${controller}`);
    const fn = moduleCtrl[methodName];
    if (typeof fn === 'function') {
      fn.call(app, req, res, restApi);
    }
    return;
  }

  const response = restApi.responses[0];
  if (!response) {
    res.status(404).send('no set response or example');
    return;
  }

  if (isRedirectCode(response.code)) {
    res.redirect(response.redirectURL);
    return;
  }

  const { body } = response;
  if (body.mimeType) {
    res.type(body.mimeType);
  }
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
  const apiJSON = loadApiSync(join(config.raml, config.main)) as Api;

  const restApiArr = getRestApiArr(apiJSON);
  restApiArr.forEach((restApi) => {
    app[restApi.method](toExpressUri(restApi.url), (req, res) => {
      handler(req, res, config, restApi);
    });
  });
};

export default {
  setConfig,
  app,
};
