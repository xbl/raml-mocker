import test from 'ava';
import Ajv from 'ajv';
import { validateSchema } from '@/validate';

test('give single type then validate return true', (t) => {
  const responseBody = {
    productId: 'P00001',
    name: '水杯，生命在于喝水，你不喝就会口渴',
    coverImage: 'https://s1.ax1x.com/2018/11/06/ioOhKs.png',
    description:
      '这是一个神奇的水杯，非常的神奇，倒进去的是热水，出来的还是热水。',
    price: 999,
  };

  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string'],
          },
          name: {
            type: ['string'],
          },
        },
        required: ['productId', 'name'],
      },
    },
  };

  const schema = {
    $ref: '/definitionSchema#/definitions/Product',
  };

  const ajv = new Ajv();
  const validate = ajv.addSchema(definitionSchema).compile(schema);
  const valid = validate(responseBody);
  let msg = '';
  if (!valid) {
    const [error] = validate.errors;
    const { message } = error;
    msg = message;
  }
  t.true(valid, msg);
});

test('Give type array then validate return true', (t) => {
  const responseBody = {
    productId: null,
    name: '水杯，生命在于喝水，你不喝就会口渴',
    coverImage: 'https://s1.ax1x.com/2018/11/06/ioOhKs.png',
    description:
      '这是一个神奇的水杯，非常的神奇，倒进去的是热水，出来的还是热水。',
    price: 999,
  };

  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string', 'null'],
          },
          name: {
            type: ['string'],
          },
        },
        required: ['productId', 'name'],
      },
    },
  };

  const schema = {
    $ref: '/definitionSchema#/definitions/Product',
  };

  const ajv = new Ajv();
  const validate = ajv.addSchema(definitionSchema).compile(schema);
  const valid = validate(responseBody);
  let msg = '';
  if (!valid) {
    const [error] = validate.errors;
    const { message } = error;
    msg = message;
  }
  t.true(valid, msg);
});

test('give array type then validate return true', (t) => {
  const responseBody = [
    {
      productId: 'P00001',
      name: '水杯，生命在于喝水，你不喝就会口渴',
      coverImage: 'https://s1.ax1x.com/2018/11/06/ioOhKs.png',
      description:
        '这是一个神奇的水杯，非常的神奇，倒进去的是热水，出来的还是热水。',
      price: 999,
    },
    {
      productId: 'P00001',
      name: '水杯，生命在于喝水，你不喝就会口渴',
      coverImage: 'https://s1.ax1x.com/2018/11/06/ioOhKs.png',
      description:
        '这是一个神奇的水杯，非常的神奇，倒进去的是热水，出来的还是热水。',
      price: 999,
    },
  ];

  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string'],
          },
          name: {
            type: ['string'],
          },
        },
        required: ['productId', 'name'],
      },
    },
  };

  const $ref = { $ref: '/definitionSchema#/definitions/Product' };
  const schema = {
    items: [$ref],
    additionalItems: $ref,
  };

  const ajv = new Ajv();
  const validate = ajv.addSchema(definitionSchema).compile(schema);
  const valid = validate(responseBody);
  let msg = '';
  if (!valid) {
    const [error] = validate.errors;
    const { message } = error;
    msg = message;
  }
  t.true(valid, msg);
});

test('give string array type then validate return true', (t) => {
  const responseBody = [
    {
      productId: 'P00001',
      coverImage: ['1.png', '2.png'],
    },
  ];

  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string'],
          },
          coverImage: {
            items: [{ type: 'string' }],
            additionalItems: {
              type: 'string',
            },
          },
        },
        required: ['productId', 'coverImage'],
      },
    },
  };

  const $ref = { $ref: '/definitionSchema#/definitions/Product' };
  const schema = {
    items: [$ref],
    additionalItems: $ref,
  };

  const ajv = new Ajv();
  const validate = ajv.addSchema(definitionSchema).compile(schema);
  const valid = validate(responseBody);
  let msg = '';
  if (!valid) {
    const [error] = validate.errors;
    const { message } = error;
    msg = message;
  }
  t.true(valid, msg);
});


test('give string array type then validateSchema return true', (t) => {
  const responseBody = [
    {
      productId: 'P00001',
      coverImage: ['1.png', '2.png'],
    },
  ];

  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string'],
          },
          coverImage: {
            items: [{ type: 'string' }],
            additionalItems: {
              type: 'string',
            },
          },
        },
        required: ['productId', 'coverImage'],
      },
    },
  };

  const $ref = { $ref: '/definitionSchema#/definitions/Product' };
  const schema = {
    items: [$ref],
    additionalItems: $ref,
  };

  const valid = validateSchema(definitionSchema, schema, responseBody);
  t.true(valid);
});

test('give string array type then validateSchema throws error', (t) => {
  const responseBody = [
    {
      productId: 1,
      coverImage: ['1.png', '2.png'],
    },
  ];

  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string'],
          },
          coverImage: {
            items: [{ type: 'string' }],
            additionalItems: {
              type: 'string',
            },
          },
        },
        required: ['productId', 'coverImage'],
      },
    },
  };

  const $ref = { $ref: '/definitionSchema#/definitions/Product' };
  const schema = {
    items: [$ref],
    additionalItems: $ref,
  };

  const error = t.throws(() => {
    validateSchema(definitionSchema, schema, responseBody)
  });
  t.truthy(error.message);
});


test('give string array type then validateSchema throws error Missing custom type', (t) => {
  const responseBody = [
    {
      productId: 1,
      coverImage: ['1.png', '2.png'],
    },
  ];

  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string'],
          },
          coverImage: {
            items: [{ type: 'string' }],
            additionalItems: {
              type: 'string',
            },
          },
        },
        required: ['productId', 'coverImage'],
      },
    },
  };

  const $ref = { $ref: '/definitionSchema#/definitions/Product1' };
  const schema = {
    items: [$ref],
    additionalItems: $ref,
  };

  const error = t.throws(() => {
    validateSchema(definitionSchema, schema, responseBody);
  });
  t.truthy(error.message.includes('Missing custom type'));
});
