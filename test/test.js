import test from 'ava';
import { parseRAMLSync } from 'raml-1-parser';
import { getDefinitionSchama } from '../src/read_raml';

// const readRaml = require('../src/read_raml');

test('when read raml given Product type then get definitionSchema object', t => {
  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string']
          },
          name: {
            type: ['number']
          }
        },
        required: ['productId', 'name']
      }
    }
  };
  const apiJSON = parseRAMLSync(
    `
#%RAML 1.0
---
types:
  Product:
    type: object
    properties:
      productId:
        type: string
      name: number
  `,
    {
      serializeMetadata: false
    }
  );
  t.deepEqual(getDefinitionSchama(apiJSON), definitionSchema);
});

test('when read raml given Product.productId no required type then get definitionSchema object', t => {
  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string']
          },
          name: {
            type: ['number']
          }
        },
        required: ['name']
      }
    }
  };
  const ramlStr = `
#%RAML 1.0
---
types:
  Product:
    type: object
    properties:
      productId:
        type: string
        required: false
      name: number
  `;
  const apiJSON = parseRAMLSync(ramlStr, {
    serializeMetadata: false
  });
  t.deepEqual(getDefinitionSchama(apiJSON), definitionSchema);
});

test('when read raml given Product.productId has minLength type then get definitionSchema object', t => {
  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string'],
            minLength: 1,
            maxLength: 22
          },
          name: {
            type: ['number']
          }
        },
        required: ['name']
      }
    }
  };
  const ramlStr = `
#%RAML 1.0
---
types:
  Product:
    type: object
    properties:
      productId:
        type: string
        required: false
        minLength: 1
        maxLength: 22
      name: number
  `;
  const apiJSON = parseRAMLSync(ramlStr, {
    serializeMetadata: false
  });
  t.deepEqual(getDefinitionSchama(apiJSON), definitionSchema);
});
