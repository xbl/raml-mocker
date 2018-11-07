const { join } = require('path');
const raml = require('raml-1-parser');
const { isRedirectCode } = require('./util');

const getTypeMap = apiJSON => {
  const typeMap = {};
  const typeDeclarationArr = apiJSON.types();
  typeDeclarationArr.forEach(type => {
    const typeName = type.name();
    const { properties } = type.toJSON({ serializeMetadata: false })[typeName];

    const requiredArr = [];
    Object.keys(properties).forEach(key => {
      const property = properties[key];
      // const propertyType = property.type[0];
      // console.log(propertyType);
      const { items, required, name } = property;
      if (required) {
        requiredArr.push(name);
      }
      if (items) {
        console.log(items);
      }
      // console.log(property);
    });
    typeMap[typeName] = properties;
  });
  return typeMap;
};

const getWebApiArr = apiJSON => {
  const webApiArr = [];
  apiJSON.allResources().forEach(resource => {
    const absoluteUri = resource.absoluteUri();
    resource.methods().forEach(method => {
      const webApi = { absoluteUri, method: method.method() };
      method.annotations().forEach(annotation => {
        const json = annotation.toJSON();
        if (json.name !== 'controller') return;
        webApi.controller = json.structuredValue;
      });

      webApi.responses = [];
      method.responses().forEach(response => {
        const code = response.code().value();
        // 30x
        if (isRedirectCode(code)) {
          response.headers().forEach(typeDeclaration => {
            if (typeDeclaration.name().toLowerCase() === 'location') {
              const redirectURL = typeDeclaration.type()[0];
              webApi.responses.push({ code, location: redirectURL });
            }
          });
          return;
        }
        response.body().forEach(typeDeclaration => {
          const mimeType = typeDeclaration.name();
          const example = typeDeclaration.example();
          // const type = typeDeclaration.type()[0];
          // if (type.includes('[]')) {
          //   // console.log(type);
          // } else {
          //   console.log(typeMap[type]);
          // }
          if (example) {
            webApi.responses.push({ code, body: example.value(), mimeType });
          }
        });
      });
      webApiArr.push(webApi);
    });
  });
};

module.exports = config => {
  const apiJSON = raml.loadApiSync(join(config.raml, config.main), {
    serializeMetadata: false
  });
  // const typeMap =
  getTypeMap(apiJSON);
  // console.log(typeMap);
  return getWebApiArr(apiJSON);
};
