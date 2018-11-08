const { join } = require('path');
const raml = require('raml-1-parser');
const { isRedirectCode } = require('./util');

const BASE_TYPE = [
  'string',
  'number',
  'boolean',
  'array',
  'object',
  'integer',
  'null'
];
const getDefinitionSchama = apiJSON => {
  const $id = '/definitionSchema';
  const definitionSchama = {
    $id,
    definitions: {}
  };
  const typeDeclarationArr = apiJSON.types();
  typeDeclarationArr.forEach(clazz => {
    const clazzName = clazz.name();
    const jsonObj = clazz.toJSON({ serializeMetadata: false });
    const { properties } = jsonObj[clazzName];

    if (!properties) return;

    const requiredArr = [];
    const schamaProperties = {};
    Object.keys(properties).forEach(key => {
      const {
        items,
        required,
        name,
        type,
        maxLength,
        minLength,
        pattern
      } = properties[key];

      const property = {
        type
      };
      if (maxLength) {
        property.maxLength = maxLength;
      }
      if (minLength) {
        property.minLength = minLength;
      }
      if (pattern) {
        property.pattern = pattern;
      }
      if (required) {
        requiredArr.push(name);
        delete property.required;
      }
      schamaProperties[name] = property;

      if (!BASE_TYPE.includes(type[0])) {
        schamaProperties[name] = { $ref: `${$id}#/definitions/${type}` };
        return;
      }

      if (items) {
        const $ref = `${$id}#/definitions/${items}`;
        schamaProperties[name] = {
          items: [{ $ref }],
          additionalItems: {
            $ref
          }
        };
      }
    });

    const sechemaPro = {
      type: 'object',
      properties: schamaProperties,
      required: requiredArr
    };

    definitionSchama.definitions[clazzName] = sechemaPro;
  });
  return definitionSchama;
};

exports.getDefinitionSchama = getDefinitionSchama;

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

exports.getWebApiArr = getWebApiArr;

exports.load = config => {
  const apiJSON = raml.loadApiSync(join(config.raml, config.main), {
    serializeMetadata: false
  });
  // const typeMap =x
  // getTypeMap(apiJSON);
  return getWebApiArr(apiJSON);
};
