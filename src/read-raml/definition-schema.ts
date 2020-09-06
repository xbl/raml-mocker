import $Ref from '../models/$ref';
import Schema from '../models/schema';
import { setProps } from './utils';
import { BASE_TYPE } from './constant';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';


export const getDefinitionSchema = (apiJSON: Api): Schema => {
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

    if (!properties) {
      return;
    }

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
