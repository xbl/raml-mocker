const Ajv = require('ajv');

exports.validate = (definitionSchema, schema, data) => {
  const ajv = new Ajv();

  const validate = ajv.addSchema(definitionSchema).compile(schema);
  const valid = validate(data);

  return {
    valid,
    error: !valid && validate.errors.pop()
  };
};

