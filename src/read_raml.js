const { join } = require('path');
const raml = require('raml-1-parser');
const { isRedirectCode } = require('./util');

module.exports = (config) => {
  const apiJSON = raml.loadApiSync(join(config.raml, config.main), { serializeMetadata: false });

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

  return webApiArr;
};
