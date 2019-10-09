import { isRedirectCode } from '../util';
import RestAPI from '../models/rest-api';
import Response from '../models/response';
import Schema from '../models/schema';
import { setProps, getPathname } from './utils';
import { BASE_TYPE, ANY_TYPE } from './constant';
import Body from '../models/body';
import Parameter from '../models/parameter';
import { TypeDeclaration, Api, Response as RamlResponse,
  Resource, Method } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { isEmpty } from 'lodash';

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

const getPostBody = ([body]: TypeDeclaration[]): Body => {
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
  const uriParameters = {};
  const params = getAnnotationByName('uriParameters', method);
  if (!isEmpty(params)) {
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
    uriParameters[name] = value;
  });

  return uriParameters;
};

const getHeaderLocation = (response: RamlResponse) => {
  let redirectURL;
  response.headers().forEach((typeDeclaration) => {
    if (typeDeclaration.name().toLowerCase() === 'location') {
      redirectURL = typeDeclaration.type()[0];
    }
  });
  return redirectURL;
};

const getResponseByBody = (code, body: TypeDeclaration): Response => {
  const example = body.example();
  if (!example) { return; }
  const mimeType = body.name();
  const type = body.type().pop();
  const restApiResp: Response = {
    code,
    body: {
      text: example.value(),
      mimeType,
    },
  };
  const schema = getSchemaByType(type);
  setProps(restApiResp, 'schema', schema);
  return restApiResp;
};

const getRestApiByMethod = (url: string, method: Method, resource: Resource): RestAPI => {
  const restApi: RestAPI = { url, method: method.method() as string };
  const description = method.description() && method.description().value();
  setProps(restApi, 'description', description);

  const controller = getAnnotationByName('controller', method);
  setProps(restApi, 'controller', controller);

  const runner = getAnnotationByName('runner', method);
  setProps(restApi, 'runner', runner);

  restApi.uriParameters = getUriParameters(resource, method);

  restApi.queryParameters = getQueryParameters(method.queryParameters());
  const postBody = getPostBody(method.body());
  setProps(restApi, 'body', postBody);

  restApi.responses = [];
  method.responses().forEach((response) => {
    const code = parseInt(response.code().value(), 10);
    // 30x
    if (isRedirectCode(code)) {
      const redirectURL = getHeaderLocation(response);
      restApi.responses.push({ code, redirectURL });
      return;
    }

    restApi.responses = restApi.responses.concat(response.body()
      .map((body) => getResponseByBody(code, body))
      .filter((webApiResp: Response) => webApiResp));
  });
  return restApi;
};

export const getRestApiArr = (apiJSON: Api): RestAPI[] => {
  let restApiArr: RestAPI[] = [];
  apiJSON.allResources().forEach((resource: Resource) => {
    const url = getPathname(resource.absoluteUri() as string);
    restApiArr = restApiArr.concat(resource.methods()
      .map((method: Method) => getRestApiByMethod(url, method, resource)));
  });
  return restApiArr;
};
