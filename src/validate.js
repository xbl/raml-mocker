const Ajv = require('ajv');

exports.validate = (definitionSchema, schema, data) => {
  const ajv = new Ajv();
  let validate;
  try {
    validate = ajv.addSchema(definitionSchema).compile(schema);
  } catch (error) {
    if (error.missingRef) {
      throw Error(`Missing custom type "${error.missingRef.split('/').pop()}"`);
    }
  }
  const valid = validate(data);

  return {
    valid,
    error: !valid && validate.errors.pop()
  };
};
