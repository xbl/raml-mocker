var express = require('express');
var app = express();
var raml = require('raml-1-parser');
var { isRedirectCode } = require('./util');

app.use(function (req, res, next) {
  console.log('PATH: %s, METHOD: %s', req.path, req.method);
  next();
});

exports.setConfig = (config) => {

  var apiJSON = raml.loadApiSync(config.raml, {serializeMetadata: false});

  const webApiArr = [];
  apiJSON.allResources().forEach(resource => {
    const absoluteUri = resource.absoluteUri();
    resource.methods().forEach(method => {
      const webApi = {absoluteUri, method: method.method()};
      method.annotations().forEach(annotation => {
        const json = annotation.toJSON();
        if (json.name !== 'controller')
          return
        webApi.controller = json.structuredValue;
      })

      webApi.responses = []
      method.responses().forEach(response => {
        const code = response.code().value();
        // 30x
        if (isRedirectCode(code)) {
          response.headers().forEach(typeDeclaration => {
            if (typeDeclaration.name().toLowerCase() === 'location') {
              const redirectURL = typeDeclaration.type()[0];
              webApi.responses.push({code, location: redirectURL});
            }
          });
          return ;
        }
        response.body().forEach(typeDeclaration => {
          const mimeType = typeDeclaration.name();
          const example = typeDeclaration.example();
          if (example) {
            webApi.responses.push({code, body: example.value(), mimeType});
          }
        })
      })
      webApiArr.push(webApi);
    })
  });

  webApiArr.forEach(webApi => {
    app[webApi.method](webApi.absoluteUri, (req, res) => {
      if (webApi.controller) {
        const controller = webApi.controller.split('#');
        require(`${config.controller}/${controller[0]}`)[controller[1]].call(app, req, res, webApi);
        return ;
      }

      const response = webApi.responses[0];
      if (!response)
        return res.status(404).send('no set reponse or example');

      if (isRedirectCode(response.code)) {
        return res.redirect(response.location);
      }

      response.mimeType && res.type(response.mimeType);
      res.status(response.code);
      response.body && res.send(response.body);
    });
  });

};

exports.app = app;
