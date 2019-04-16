import Ajv from 'ajv';
import { jsonPath } from './util';
import Schema from './models/schema';

const buildErrorMessage = (error: Ajv.ErrorObject, data): string => {
  let msg = '';
  let result = data;
  const { message, dataPath } = error;
  msg = message;
  if (dataPath) {
    result = jsonPath(data, dataPath);
  }
  msg += `\ninfo:${dataPath}\n${JSON.stringify(result, null, '\t')}\n`;
  return msg;
};

export const validateSchema = (definitionSchema: Schema, schema: Schema, data): boolean => {
  if (!schema) {
    return;
  }
  const ajv = new Ajv();
  let validate: Ajv.ValidateFunction;
  try {
    validate = ajv.addSchema(definitionSchema).compile(schema);
  } catch (error) {
    if (error.missingRef) {
      throw Error(`Missing custom type "${error.missingRef.split('/').pop()}"`);
    }
    throw error;
  }
  const valid = validate(data) as boolean;
  if (!valid) {
    const error = validate.errors.pop();
    throw new Error(buildErrorMessage(error, data));
  }
  return valid;
};
