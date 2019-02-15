import test from 'ava';
import { parseRAMLSync } from 'raml-1-parser';
import {
  getDefinitionSchema,
  getRestApiArr,
  getAnnotationByName
} from '../src/read-raml';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml08parserapi';

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
  const apiJSON = parseRAMLSync(ramlStr);
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
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
  const apiJSON = parseRAMLSync(ramlStr);
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});

test('when read raml given Product.productId has minLength then get definitionSchema object', t => {
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
  const apiJSON = parseRAMLSync(ramlStr);
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});

test('when read raml given Product and Paragraph then get definitionSchema object', t => {
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
      },
      Paragraph: {
        type: 'object',
        properties: {
          title: {
            type: ['string']
          },
          text: {
            type: ['string']
          }
        },
        required: ['title', 'text']
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

  Paragraph:
    type: object
    properties:
      title:
      text:
  `;
  const apiJSON = parseRAMLSync(ramlStr);
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});

test('when read raml given Product of Paragraph then get definitionSchema object', t => {
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
      },
      Paragraph: {
        type: 'object',
        properties: {
          title: {
            type: ['string']
          },
          text: {
            type: ['string']
          },
          product: {
            $ref: '/definitionSchema#/definitions/Product'
          }
        },
        required: ['title', 'text']
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

  Paragraph:
    type: object
    properties:
      title:
      text:
      product:
        type: Product
        required: false
  `;
  const apiJSON = parseRAMLSync(ramlStr);
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});

test('when read raml given Type Array then get definitionSchema object', t => {
  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Article: {
        type: 'object',
        properties: {
          articleId: {
            type: ['string']
          },
          author: {
            type: ['string']
          },
          paragraphs: {
            items: [
              {
                $ref: '/definitionSchema#/definitions/Paragraph'
              }
            ],
            additionalItems: {
              $ref: '/definitionSchema#/definitions/Paragraph'
            }
          }
        },
        required: ['author', 'paragraphs']
      },
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
      },
      Paragraph: {
        type: 'object',
        properties: {
          title: {
            type: ['string']
          },
          text: {
            type: ['string']
          },
          product: {
            $ref: '/definitionSchema#/definitions/Product'
          }
        },
        required: ['title', 'text']
      }
    }
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
  const apiJSON = parseRAMLSync(ramlStr);
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});

test('when read raml given string Array then get definitionSchema object', t => {
  const definitionSchema = {
    $id: '/definitionSchema',
    definitions: {
      Product: {
        type: 'object',
        properties: {
          productId: {
            type: ['string']
          },
          coverImage: {
            items: [{ type: 'string' }],
            additionalItems: {
              type: 'string'
            }
          }
        },
        required: ['productId', 'coverImage']
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
      coverImage: string[]
  `;
  const apiJSON = parseRAMLSync(ramlStr);
  t.deepEqual(getDefinitionSchema(apiJSON), definitionSchema);
});

test('when read raml given /products then get webAPI array', t => {
  const webAPIArr = [
    {
      url: '/products',
      method: 'get',
      description: '商品列表',
      queryParameter: {},
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text:`{
  "a": 1
}
`,
          }
        }
      ]
    }
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
  const apiJSON = parseRAMLSync(ramlStr);

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, webAPIArr);
});

test('when read raml given /products has queryParameter then get webAPI array', t => {
  const webAPIArr = [
    {
      url: '/products',
      method: 'get',
      description: '商品列表',
      queryParameter: {
        isStar: 'true'
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
          }
        }
      ]
    }
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
  const apiJSON = parseRAMLSync(ramlStr);

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, webAPIArr);
});

test('when read raml given post /products has data then get webAPI array', t => {
  const webAPIArr = [
    {
      url: '/products',
      method: 'post',
      description: '商品列表',
      queryParameter: {},
      body: {
        mimeType: 'application/json',
        text: `{
  "isStar": true
}`
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
          }
        }
      ]
    }
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
  const apiJSON = parseRAMLSync(ramlStr);

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, webAPIArr);
});

test('when read raml given /products has uriParameters then get webAPI array', t => {
  const webAPIArr = [
    {
      url: '/products/{productId}',
      method: 'get',
      uriParameters: {
        id: 'aaaa'
      },
      queryParameter: {},
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: `{
  "a": 1
}
`,
          }
        }
      ]
    }
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
  const apiJSON = parseRAMLSync(ramlStr);

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, webAPIArr);
});

test('When read raml given (runner) annotations then get annotation object', t => {
  const expectResult = {
    id: {
      description: 'article id',
      example: 'aaaa'
    }
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
  const apiJSON = <Api>parseRAMLSync(ramlStr);

  const [resource] = apiJSON.allResources();
  const [method] = resource.methods();
  const result = getAnnotationByName('runner', method);
  t.deepEqual(result, expectResult);
});
