const Ajv = require('ajv');
const chalk = require('chalk');

exports.validate = (definitionSchema, schema, data) => {
  const ajv = new Ajv();

  const validate = ajv.addSchema(definitionSchema).compile(schema);
  const valid = validate(data);

  return {
    valid,
    error: !valid && validate.errors.pop()
  };
};

exports.output = (valid, message, validInfo, webApi) => {
  let color = 'green';
  let icon = '✔';

  if (!valid) {
    color = 'red';
    icon = '✖';
  }
  console.log(
    chalk`{${color} ${icon} 请求：} {underline ${
      webApi.absoluteUri
    }}  \n{${color} ${message}}\n${validInfo}`
  );
};
