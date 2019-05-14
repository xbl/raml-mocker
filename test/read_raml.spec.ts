import test from 'ava';
import { parseRAMLSync } from 'raml-1-parser';
import {
  getDefinitionSchema,
  getRestApiArr,
  getAnnotationByName,
} from '@/read-raml';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';

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

test('Given read raml /products When getRestApiArr() Then get webAPI array', (t) => {
  const webAPIArr = [
    {
      url: '/products',
      method: 'get',
      description: '商品列表',
      queryParameters: [],
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: `{
  "a": 1
}
`,
          },
        },
      ],
    },
  ];
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json
/products:
  get:
    description: 商品列表
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, webAPIArr);
});

test('Given read raml when /products has queryParameter Then get webAPI array', (t) => {
  const webAPIArr = [
    {
      url: '/products',
      method: 'get',
      description: '商品列表',
      queryParameters: [{
        name: 'isStar',
        example: 'true',
        required: false,
        type: 'boolean',
      }],
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: `{
  "a": 1
}
`,
          },
        },
      ],
    },
  ];
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json
/products:
  get:
    description: 商品列表
    queryParameters:
      isStar:
        description: 是否精选
        type: boolean
        required: false
        example: true
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, webAPIArr);
});

test('Given read raml When post /products has data Then get webAPI array', (t) => {
  const webAPIArr = [
    {
      url: '/products',
      method: 'post',
      description: '商品列表',
      queryParameters: [],
      body: {
        mimeType: 'application/json',
        text: `{
  "isStar": true
}`,
      },
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: `{
  "a": 1
}
`,
          },
        },
      ],
    },
  ];
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json
/products:
  post:
    description: 商品列表
    body:
      example:
        {
          isStar: true
        }
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, webAPIArr);
});

test('Given read raml When /products has uriParameters Then get webAPI array', (t) => {
  const webAPIArr = [
    {
      url: '/products/{productId}',
      method: 'get',
      uriParameters: {
        id: 'aaaa',
      },
      queryParameters: [],
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: `{
  "a": 1
}
`,
          },
        },
      ],
    },
  ];
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json
/products/{productId}:
  get:
    (uriParameters):
      id:
        description: article id
        example: aaaa
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, webAPIArr);
});

test('Given read raml  When(runner) annotations Then get annotation object', (t) => {
  const expectResult = {
    id: {
      description: 'article id',
      example: 'aaaa',
    },
  };
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json
/products/{productId}:
  get:
    (runner):
      id:
        description: article id
        example: aaaa
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const [resource] = apiJSON.allResources();
  const [method] = resource.methods();
  const result = getAnnotationByName('runner', method);
  t.deepEqual(result, expectResult);
});
