const express = require('express');

const app = express();
const raml = require('raml-1-parser');
const { isRedirectCode } = require('./util');

app.use((req, res, next) => {
  // eslint-disable-next-line
  console.log('PATH: %s, METHOD: %s', req.path, req.method);
  next();
});

exports.setConfig = (config) => {
  const apiJSON = raml.loadApiSync(config.raml, { serializeMetadata: false });

  const webApiArr = [];
  apiJSON.allResources().forEach((resource) => {
    const absoluteUri = resource.absoluteUri();
    resource.methods().forEach((method) => {
      const webApi = { absoluteUri, method: method.method() };
      method.annotations().forEach((annotation) => {
        const json = annotation.toJSON();
        if (json.name !== 'controller') return;
        webApi.controller = json.structuredValue;
      });

      webApi.responses = [];
      method.responses().forEach((response) => {
        const code = response.code().value();
        // 30x
        if (isRedirectCode(code)) {
          response.headers().forEach((typeDeclaration) => {
            if (typeDeclaration.name().toLowerCase() === 'location') {
              const redirectURL = typeDeclaration.type()[0];
              webApi.responses.push({ code, location: redirectURL });
            }
          });
          return;
        }
        response.body().forEach((typeDeclaration) => {
          const mimeType = typeDeclaration.name();
          const example = typeDeclaration.example();
          if (example) {
            webApi.responses.push({ code, body: example.value(), mimeType });
          }
        });
      });
      webApiArr.push(webApi);
    });
  });

  webApiArr.forEach((webApi) => {
    app[webApi.method](webApi.absoluteUri, (req, res) => {
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
      if (response.body) res.send(response.body);
    });
  });
};

exports.app = app;
