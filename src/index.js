const fs = require('fs');
const { join } = require('path');
const raml = require('raml-1-parser');

const readRaml = require('./read-raml');
const { loadConfig } = require('./util');
const HttpClient = require('./http-client');

const env = process.env.NODE_ENV;

let projectPath;
let webApiArr;

exports.initProject = path => {
  projectPath = path;
  const config = loadConfig(
    fs.readFileSync(`${projectPath}/.raml-config.json`, 'utf8')
  );
  let host = `http://localhost:${config.port}`;
  if (config.runner && env) {
    host = config.runner[env];
  }
  if (!host)
    throw Error(`Can't find host in .raml-config.json when env is "${env}"`);
  HttpClient.setHost(host);

  const apiJSON = raml.loadApiSync(join(config.raml, config.main), {
    serializeMetadata: false
  });
  webApiArr = readRaml.getWebApiArr(apiJSON);
};

exports.loadApi = description => {
  if (!projectPath) throw Error('Please init project first!');
  if (!description) throw Error('Please set API description!');
  if (!webApiArr) throw Error("Can't find API");
  const api = webApiArr
    .filter(webApi => webApi.description === description)
    .pop();

  return (uriParameters, queryParameter, body) =>
    HttpClient.send(api, uriParameters, queryParameter, body);
};
