import test from 'ava';
import { parseRAMLSync } from 'raml-1-parser';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { getDefinitionSchema } from '@/read-raml/definition-schema';

test('Given read raml and Product type When getDefinitionSchema Then get object', (t) => {
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
            type: ['number'],
          },
        },
        required: ['productId', 'name'],
      },
    },
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
      name: number
    `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});

test(`Given read raml And Product.productId no required
  When getDefinitionSchema Then get definitionSchema object`, (t) => {
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
            type: ['number'],
          },
        },
        required: ['name'],
      },
    },
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
  const apiJSON = parseRAMLSync(ramlStr) as Api;
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});

test(`Given read raml And Product.productId has minLength When definitionSchema then got object`, (t) => {
  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string'],
            minLength: 1,
            maxLength: 22,
          },
          name: {
            type: ['number'],
          },
        },
        required: ['name'],
      },
    },
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
  const apiJSON = parseRAMLSync(ramlStr) as Api;
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});

test('when read raml given Product and Paragraph then get definitionSchema object', (t) => {
  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string'],
            minLength: 1,
            maxLength: 22,
          },
          name: {
            type: ['number'],
          },
        },
        required: ['name'],
      },
      Paragraph: {
        type: 'object',
        properties: {
          title: {
            type: ['string'],
          },
          text: {
            type: ['string'],
          },
        },
        required: ['title', 'text'],
      },
    },
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

  Paragraph:
    type: object
    properties:
      title:
      text:
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});

test('Given read raml And Product of Paragraph When definitionSchema Then get object', (t) => {
  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string'],
            minLength: 1,
            maxLength: 22,
          },
          name: {
            type: ['number'],
          },
        },
        required: ['name'],
      },
      Paragraph: {
        type: 'object',
        properties: {
          title: {
            type: ['string'],
          },
          text: {
            type: ['string'],
          },
          product: {
            $ref: '/definitionSchema#/definitions/Product',
          },
        },
        required: ['title', 'text'],
      },
    },
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

  Paragraph:
    type: object
    properties:
      title:
      text:
      product:
        type: Product
        required: false
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});

test('Given read raml and Type is Array When getDefinitionSchema Then get definitionSchema object', (t) => {
  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Article: {
        type: 'object',
        properties: {
          articleId: {
            type: ['string'],
          },
          author: {
            type: ['string'],
          },
          paragraphs: {
            items: [
              {
                $ref: '/definitionSchema#/definitions/Paragraph',
              },
            ],
            additionalItems: {
              $ref: '/definitionSchema#/definitions/Paragraph',
            },
          },
        },
        required: ['author', 'paragraphs'],
      },
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string'],
            minLength: 1,
            maxLength: 22,
          },
          name: {
            type: ['number'],
          },
        },
        required: ['name'],
      },
      Paragraph: {
        type: 'object',
        properties: {
          title: {
            type: ['string'],
          },
          text: {
            type: ['string'],
          },
          product: {
            $ref: '/definitionSchema#/definitions/Product',
          },
        },
        required: ['title', 'text'],
      },
    },
  };
  const ramlStr = `
#%RAML 1.0
---
types:
  Article:
    type: object
    properties:
      articleId:
        type: string
        required: false
      author: string
      paragraphs: Paragraph[]
  Product:
    type: object
    properties:
      productId:
        type: string
        required: false
        minLength: 1
        maxLength: 22
      name: number

  Paragraph:
    type: object
    properties:
      title:
      text:
      product:
        type: Product
        required: false
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});

test('Given read raml, type is string array When getDefinitionSchema Then get definitionSchema object', (t) => {
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
  const ramlStr = `
#%RAML 1.0
---
types:
  Product:
    type: object
    properties:
      productId:
        type: string
      coverImage: string[]
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});
