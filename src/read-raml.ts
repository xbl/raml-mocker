import { isRedirectCode } from './util';
import RestAPI from './models/rest-api';
import Response from './models/response';
import Schema from './models/schema';
import $Ref from './models/$ref';
import Body from './models/body';
import Parameter from './models/parameter';
import { TypeDeclaration, Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';

const ANY_TYPE = 'any';
const BASE_TYPE = [
  'string',
  'number',
  'boolean',
  'array',
  'object',
  'integer',
  'null',
  ANY_TYPE,
];

const setProps = (obj, property, value) => {
  if (value) { obj[property] = value; }
};

export const getDefinitionSchema = (apiJSON: Api) => {
  const $id = '/definitionSchema';
  const definitionSchema = {
    $id,
    definitions: {},
  };
  const clazzArr = apiJSON.types();
  clazzArr.forEach((clazz) => {
    const clazzName = clazz.name();
    const jsonObj = clazz.toJSON({ serializeMetadata: false });
    const { properties } = jsonObj[clazzName];

    if (!properties) { return; }

    const requiredArr = [];
    const schemaProperties = {};
    Object.keys(properties).forEach((key) => {
      const {
        items,
        required,
        name,
        type,
        maxLength,
        minLength,
        pattern,
      } = properties[key];

      const property = {
        type: type.map(String),
      };
      setProps(property, 'maxLength', maxLength);
      setProps(property, 'minLength', minLength);
      setProps(property, 'pattern', pattern);
      if (required) {
        requiredArr.push(name);
      }
      schemaProperties[name] = property;

      if (!BASE_TYPE.includes(type[0])) {
        schemaProperties[name] = { $ref: `${$id}#/definitions/${type[0]}` };
        return;
      }

      if (items) {
        let $ref: $Ref = { type: items };
        if (!BASE_TYPE.includes(items)) {
          $ref = { $ref: `${$id}#/definitions/${items}` };
        }
        schemaProperties[name] = {
          items: [$ref],
          additionalItems: $ref,
        };
      }
    });

    const schemaPro = {
      type: 'object',
      properties: schemaProperties,
      required: requiredArr,
    };

    definitionSchema.definitions[clazzName] = schemaPro;
  });
  return definitionSchema;
};

const getSchemaByType = (type): Schema => {
  if (!type) { return undefined; }
  const newType = type.replace('[]', '');
  if (newType === ANY_TYPE) {
    return undefined;
  }
  if (BASE_TYPE.includes(newType)) {
    return { type: newType };
  }
  const $ref = { $ref: `/definitionSchema#/definitions/${newType}` };
  let schema: Schema = $ref;
  if (type.includes('[]')) {
    schema = {
      items: [$ref],
      additionalItems: $ref,
    };
  }
  return schema;
};

const getQueryParameters = (queryParameters): Parameter[] => {
  if (!Array.isArray(queryParameters)) { return; }
  const newParams: Parameter[] = [];
  queryParameters.forEach((param) => {
    if (!param.example()) { return; }
    const value = param.example().value();
    if (!value) { return; }
    // TODO: 文档中说返回的是字符串，结果返回的是数组：
    // https://raml-org.github.io/raml-js-parser-2/interfaces/_src_raml1_artifacts_raml08parserapi_.parameter.html#type
    let type = param.type();
    if (Array.isArray(param.type())) {
      type = param.type().pop();
    }
    newParams.push({name: param.name(), example: value, required: param.required(), type });
  });
  return newParams;
};

const getPostBody = ([body]: TypeDeclaration[]): Body​​ => {
  if (!body || !body.example()) { return; }
  const value = body.example().value();
  if (!value) { return; }
  return {
    mimeType: body.name(),
    text: value,
  };
};

export const getAnnotationByName = (name, method) => {
  let annotationObj;
  method.annotations().forEach((annotation) => {
    const json = annotation.toJSON();
    if (json.name !== name) { return; }
    annotationObj = json.structuredValue;
  });
  return annotationObj;
};

const getUriParameters = (resource, method) => {
  let uriParameters;
  const params = getAnnotationByName('uriParameters', method);
  if (params) {
    if (!uriParameters) { uriParameters = {}; }
    Object.keys(params).forEach((key) => {
      const param = params[key];
      if (!param) { return; }
      const example = String(param.example);
      if (param && example) { uriParameters[key] = example; }
    });
  }

  // has bug: https://github.com/raml-org/raml-js-parser-2/issues/829
  resource.allUriParameters().forEach((parameter) => {
    const name = parameter.name();
    const example = parameter.example();
    let value = '';
    if (!example) { return; }
    value = example.value();
    if (!uriParameters) { uriParameters = {}; }
    uriParameters[name] = value;
  });

  return uriParameters;
};

export const getRestApiArr = (apiJSON: Api): RestAPI[] => {
  const restApiArr: RestAPI[] = [];
  apiJSON.allResources().forEach((resource) => {
    const url = resource.absoluteUri() as string;

    resource.methods().forEach((method) => {
      const webApi: RestAPI = { url, method: method.method() as string };

      const description = method.description() && method.description().value();
      // setProps(webApi, 'description', description);
      description && (webApi.description = description);

      const controller = getAnnotationByName('controller', method);
      // setProps(webApi, 'controller', controller);
      controller && (webApi.controller = controller);

      const runner = getAnnotationByName('runner', method);
      // setProps(webApi, 'runner', runner);
      runner && (webApi.runner = runner);

      const uriParameters = getUriParameters(resource, method);
      // setProps(webApi, 'uriParameters', uriParameters);
      uriParameters && (webApi.uriParameters = uriParameters);

      webApi.queryParameters = getQueryParameters(method.queryParameters());
      const postBody = getPostBody(method.body());
      // setProps(webApi, 'body', postBody);
      postBody && (webApi.body = postBody);

      webApi.responses = [];
      method.responses().forEach((response) => {
        const code = parseInt(response.code().value(), 10);
        // 30x
        if (isRedirectCode(code)) {
          response.headers().forEach((typeDeclaration) => {
            if (typeDeclaration.name().toLowerCase() === 'location') {
              const redirectURL = typeDeclaration.type()[0];
              webApi.responses.push({ code, redirectURL });
            }
          });
          return;
        }
        response.body().forEach((body) => {
          const example = body.example();
          if (!example) { return; }
          const mimeType = body.name();
          const type = body.type().pop();
          const webApiResp: Response = {
            code,
            body: {
              text: example.value(),
              mimeType,
            },
          };
          const schema = getSchemaByType(type);
          schema && (webApiResp.schema = schema);
          webApi.responses.push(webApiResp);
        });
      });
      restApiArr.push(webApi);
    });
  });
  return restApiArr;
};
