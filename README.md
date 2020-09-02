

# Raml-mocker

![version](https://img.shields.io/npm/v/@xbl/raml-mocker.svg)
![node (scoped)](https://img.shields.io/node/v/@xbl/raml-mocker.svg?style=flat)
[![Build Status](https://travis-ci.org/xbl/raml-mocker.svg?branch=master)](https://travis-ci.org/xbl/raml-mocker)
[![codecov](https://codecov.io/gh/xbl/raml-mocker/branch/master/graph/badge.svg)](https://codecov.io/gh/xbl/raml-mocker)

Raml-mocker 是基于 [Raml](https://raml.org/) 的 mock server，Raml 是 RESTfull API 描述语言，同时支持自定义指令。raml-mocker 可以根据 raml 描述文档读取到 API 中的 uri 及 response 中的 example 继而生成 mock server。

在 2.0 版本中增加了 API 接口的测试，所以 Raml-mocker 不仅仅是 mock server，还是一个不错的 API 接口测试工具。

## 开始

#### 初始化项目
```shell
git clone https://github.com/xbl/raml-mocker-starter.git raml-api
cd raml-api
git remote rm origin
```
#### 安装
```shell
yarn
# or
npm install
```
##### 启动 mock server
```shell
yarn start
# or
npm start
```
![console](https://tva1.sinaimg.cn/large/007S8ZIlly1ggjjwpwgwgj30o005c74v.jpg)

命令行会输出 Mock Server 的地址，不熟悉 Nodejs 的同学可以参考[这里](https://github.com/xbl/raml-mocker/wiki/%E4%BD%BF%E7%94%A8Docker%E5%90%AF%E5%8A%A8)，使用 Docker 启动。

**注意：此地址是 API 接口的 host，需要请求接口完整路径才能返回正确数据。**

#### 验证一下

```shell
curl -i http://localhost:3000/api/v1/articles
# or
curl -i http://localhost:3000/api/v1/articles/bbb
```

或者使用 Postman：

![Postman](https://tva1.sinaimg.cn/large/007S8ZIlly1ggjjvm0uvnj30u00ujdo9.jpg)



### 生成 API 可视化文档

```shell
yarn run build
# or
npm run build
```

会在工程下面生成一个 api.html 文件，双击打开即可看到一个 html 文档，如图：

![API 文档](https://tva1.sinaimg.cn/large/007S8ZIlly1ggjk7bsx7pj31px0u0wt3.jpg)

此功能使用了[raml2html](https://www.npmjs.com/package/raml2html)。



## 配置 .raml-config.json

```json
{
  "controller": "./controller",
  "raml": "./raml",
  "main": "api.raml",
  "port": 3000,
  "plugins": []
}
```

* controller: controller 目录路径，在高级篇中会有更详细说明
* raml: raml 文件目录
* main: raml 目录下的入口文件
* port:  mock server 服务端口号
* plugins: 插件（*可能会有变动*）






## 入门篇：Mock Server

在 ./raml/api 目录下创建 books 文件夹：

![目录结构](https://tva1.sinaimg.cn/large/007S8ZIlly1ggjk9ocmy8j30ea0x4q54.jpg)

在 books 文件夹中创建 books.raml 文件

```yaml
get:
  description: 图书列表
  responses:
    200:
      body:
        application/json:
          type: object
          example: !include ./books_200.json
```

在 books 文件夹中创建 books_200.json 文件

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "title": "books title",
      "description": "books desccription1"
    },
    {
      "id": 2,
      "title": "books title",
      "description": "books desccription2"
    }
  ]
}
```

修改 ./raml/api.raml

```yaml
#%RAML 1.0
---
title: hello demo API
baseUri: /
version: v1
mediaType: application/json

# 安全设置
securitySchemes: !include ./securitySchemes.raml

# 自定义资源 types，类似于资源模板，指定 type 可以减少代码，还可以覆盖模板
resourceTypes: !include ./resourceTypes.raml

# 相当于数据类型，可用于自动化测试作为验证条件
types: !include ./types.raml

#
/api/v1:
  /articles: !include ./api/articles/articles.raml
  /products: !include ./api/products/products.raml
  /login: !include ./api/users/login.raml
  # 添加
  /books: !include ./api/books/books.raml

```

![](https://tva1.sinaimg.cn/large/007S8ZIlly1ggjkeq974rj31j20u0q83.jpg)

请求时是将 /api/v1/books 与 host 拼接出来的 URL，/api/v1 可在文档 api.raml 中修改。

```shell
curl -X GET http://localhost:3000/api/v1/books
```

或者使用Postman：

![Postman](https://tva1.sinaimg.cn/large/007S8ZIlly1ggjkg5ree3j31560u0q6q.jpg)



## 高级篇：动态 Server

在 raml 文档中添加 `(controller)` 指令，即可添加动态的 Server，如：

```yaml
/books:
  type:
    resourceList:
  get:
    description: 获取用户的书籍
    (controller): user#getBook
    responses:
      200:
        body:
          type: song[]
          example: !include ./books_200.json
```

在文档中 `(controller)`  表示 controller 目录下 user.js 中 getBook 函数。

controller/user.js

```javascript
exports.getBook = (req, res, webApi) => {
  console.log(webApi);
  res.send('Hello World!');
}
```

Raml-mocker 是在 [expressjs](http://expressjs.com/) 基础上进行开发，req、res 可以参考 express 文档。


如此，raml-mocker 提供了更多可扩展空间，我们甚至可以在 controller 中实现一定的逻辑判断。

## API 自动化测试

在 1.1.0 中增加 API 测试，通过在 raml 文件中添加 response 数据格式描述，raml-runner 会发送请求，来验证 response 的数据格式是否符合预期。

![runner](https://tva1.sinaimg.cn/large/007S8ZIlly1ggjkka6ktxj30zs0u0dkg.jpg)


1. 在 types 文件中编写商品 Type，描述了返回数据的类型，以及对象中字段验证：

```yaml
Product:
  type: object
  properties:
    productId:
      type: string
      minLength: 4
      maxLength: 36
      required: true
    productName: string
    description: string
    price: number
```

2. 在 API Raml 中添加 type 字段：

``` yaml
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
        # 这里描述的商品数组
        type: Product[]
        example: !include ./products_200.json

/{productId}:
  get:
    description: 商品详情
    (controller): product#getProductDetail
    (uriParameters):
      productId:
        description: productId
        example: aaaa
    responses:
      200:
        body:
          # type 这里描述的商品
          type: Product
          example: !include ./product_200.json

```

3. 启动 Mock Server，并运行测试

```shell
# 启动 Mock Server
npm start

# 运行 API 测试
npm test
```



### 设置不同环境

运行测试时默认会测试 Mock Server的 response，设置不同的环境方式如下：

编辑 .raml-config.json 文件

```json
{
  "controller": "./controller",
  "raml": "./raml",
  "main": "api.raml",
  "port": 3000,
  "runner": {
    "local": "http://localhost:3000",
    "dev": "http://abc.com:3001"
  }
}
```

在 runner 添加不同的环境对应的 HOST，通过 SET  `NODE_ENV`  来更改运行不同环境的测试。

```shell
cross-env NODE_ENV=dev raml-runner

# 为了方便已经在模板项目中添加了 npm script，可自由更改
npm run test:dev
```



### 前置条件

以上只能满足不需要登录的 API 测试，登录的接口则需要 **优先** 执行，然后再执行其他接口，此处为了简单增加了`(runner)` 指令：

```yaml
/login
    post:
      description: 登录
      body:
        username:
          description: 用户名
          type: string
          required: true
          example: abc
        password:
          description: 密码
          type: string
          required: true
          example: abc
      (runner):
      	# 注意：这里的相对路径是相对于工程目录，而不是当前文件。
        after: ./runner/afterLogin.js
      responses:
        200:
          body:
            type: string
            example: fdafda232432fdaxfda25dfa

```

解析 raml 文件会优先执行带有 `(runner)` 指令的接口，并在执行完成之后调用 `after` 对应的 js 文件。

afterLogin.js

```javascript
module.exports = (axios, response) => {
  axios.defaults.headers.common['Authorization'] = response.data;
}

```

测试发请求使用的 [axios](https://www.npmjs.com/package/axios) 模块，所以这里会在函数参数中添加 axios 实例，以及执行 login 接口的 response 对象。通常，设置 Header 就可以满足登录所需要的大部分场景。

afterLogin.js 可返回 `Promise` 对象：

``` js
module.exports = (axios, response) => {
  return new Promise((resolve, reject) => {
    axios.defaults.headers.common['Authorization'] = response.data;
    setTimeout(() => {
      console.log('不仅设置了header，还吃了个饭，洗了个澡...');
      resolve()
    }, 3000);
  });
}
```



## API 场景测试

在 2.0 中增加了 API  的场景测试，在目录中增加了 `test` 文件夹。

1. 在 raml 中增加 description

```yaml
get:
	# 请保证 description 唯一
  description: 商品列表
  queryParameters:
    isStar:
      description: 是否精选
      type: boolean
      required: false
      example: true
    isOk:
      description: 是否精选2
      type: boolean
      required: false
      example: true
  responses:
    200:
      body:
        type: Product[]
        example: !include ./products_200.json
```

**注意：** description 的字符串会在 loadApi 时使用，所以请保证唯一。

2. 在 test 目录新增 article.spec.js

```javascript
const assert = require('assert');
const { loadApi } = require('@xbl/raml-mocker');

it('从文章列表到文章详情', async () => {
  // 根据 `文章列表` 的 description 找到 raml 描述的 API
  const getList = loadApi('文章列表');
  const { status, data: list } = await getList();
  const articleId = list[0].articleId;

  assert.equal(status, 200);
  assert.equal(articleId, 'A00001');

  const getDetail = loadApi('文章详情');
  const { data: detail } = await getDetail({ id: articleId });
  assert.equal(detail.title, '提升家里整体格调的小物件');
});
```

测试框架集成了 [Mocha](https://mochajs.org/)，断言使用 Nodejs 自带的 [Assert](https://nodejs.org/dist/latest-v10.x/docs/api/assert.html#assert_assert) 模块，开发者可以选择自己喜欢的断言库。

运行测试：

```shell
npm run test:api
```

![运行测试](https://tva1.sinaimg.cn/large/007S8ZIlly1ggjklircrmj30xm0cc0us.jpg)



### API

```javascript
loadApi(description: string): Function;
// loadApi 接收一个字符串参数，返回一个函数

anonymousFn (uriParameters, queryParameter, body): Promise<AxiosResponse>

/**
 * uriParameters: {
 *  id: 1
 *  ...
 * }
 *
 * queryParameter: {
 *  pageSize: 20
 *  ...
 * }
 *
 * body 是 POST 的数据
 */
```

AioseResponse 文档可参考[这里](https://www.npmjs.com/package/axios#response-schema)。



## 旧有项目如何使用 raml-mocker

#### HTTP Archive (HAR) 反向工程

2.0 新增的功能，帮助开发者和测试同学可以在旧有项目中快速使用 raml-mocker，并生成测试代码片段。请看[视频](http://v.youku.com/v_show/id_XNDA3NzYzOTM2MA==.html?spm=a2h3j.8428770.3416059.1)。

[![视频](http://img.alicdn.com/tfs/TB1ZbM.lOqAXuNjy1XdXXaYcVXa-160-90.png)](http://v.youku.com/v_show/id_XNDA3NzYzOTM2MA==.html?spm=a2h3j.8428770.3416059.1)

### 通过 har 文件生成 raml

以 npm 为例：

``` shell
har-convert -f ./www.npmjs.com.har -o ./raml/api.raml -filter www.npmjs.com
```

### 通过 har 文件生成测试片段

```shell
har-convert -f ./www.npmjs.com.har -o ./test/search.spec.js
```



可通过录制特定场景的请求可生成该场景的测试片段。

关于 har 可参考[这里](https://github.com/xbl/raml-mocker/wiki/HTTP-Archive-(HAR)--%E8%AF%B4%E6%98%8E)。

## Road Map

- [x] API 自动化测试
- [x] API 场景测试
- [x] 自动化增加前置条件，如：登录
- [x] 读取 HTTP Archive (HAR) format 反向工程
- [ ] 多场景的契约测试
- [ ] Mock Server 增加请求参数验证
- [ ] baseUriParameters
- [ ] 上传文件的处理



## 使用遇到问题？

使用中遇到任何问题，请给[告诉我](https://github.com/xbl/raml-mocker/issues)好吗？
