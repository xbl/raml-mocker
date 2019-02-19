# Raml-mocker

![version](https://img.shields.io/npm/v/@xbl/raml-mocker.svg)
![node (scoped)](https://img.shields.io/node/v/@xbl/raml-mocker.svg?style=flat)
[![Build Status](https://travis-ci.org/xbl/raml-mocker.svg?branch=master)](https://travis-ci.org/xbl/raml-mocker)
[![codecov](https://codecov.io/gh/xbl/raml-mocker/branch/master/graph/badge.svg)](https://codecov.io/gh/xbl/raml-mocker)

Raml-mocker 是基于 [Raml](https://raml.org/) 的 mock server，Raml 是 RESTfull API 描述语言，同时支持自定义指令。raml-mocker 可以根据 raml 描述文档读取到 API 中的 uri 及 response 中的 example 继而生成 mock server。

## 开始

#### 初始化项目
```shell
git clone https://github.com/xbl/raml-mocker-starter.git raml-api
cd raml-api
git remote rm origin
```
#### 安装方法一——NodeJs
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
#### 安装方法二——使用 docker-compose

这部分是给不太擅长折腾nodejs环境的同学准备的。在项目中增加了 `docker-compose.yml` ，需要 Docker 环境，进入目录执行

``` shell
docker-compose up
```

第一次会拉取镜像，稍稍会有些慢。

##### 停止 mock server

``` shell
docker-compose down
```

##### 在 docker 中执行命令

```shell
docker-compose exec raml-mocker sh
# 退出
exit
```



#### 验证一下

```shell
curl -i http://localhost:3000/api/v1/articles
# or
curl -i http://localhost:3000/api/v1/articles/bbb
```

### 生成 API 可视化文档

```shell
yarn run build
# or
npm run build
```

![API 文档](https://ws1.sinaimg.cn/large/006tNbRwly1fw2w6al0lfg30dw0bob0f.gif)

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

raml-mocker 可以不写 js 代码生成Mock Server，只需要在response 添加 example:

```yaml
/books:
  /{id}:
    post:
      body:
        application/json:
          type: abc
      responses:
        200:
          body:
            application/json:
              type: song
              example: !include ./books_200.json
```

books_200.json

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

webApi 会返回文档中的配置：

```json
{
  "absoluteUri": "/api/:version/users/:user_id/books",
  "method": "get",
  "controller": "user#getBook",
  "responses": [
    {
      "code": "200",
      "body": "... example ...",
      "mimeType": "application/json"
    }
  ]
}

```

如此，raml-mocker 提供了更多可扩展空间，我们甚至可以在 controller 中实现一定的逻辑判断。



### 插件

Raml-mocker 提供了插件机制，允许我们在不使用 `controller` 指令的时候对 response 的内容进行处理，例如使用[Mockjs](http://mockjs.com/)。

**注意：插件的这种形式还没有想好，未来可能会有变动，即便有变动也会尽可能向下兼容。**

.raml-config.json

```json
{
  "controller": "./controller",
  "raml": "./raml",
  "main": "api.raml",
  "port": 3000,
  "plugins": ["./plugins/mock.js"]
}

```

./plugins/mock.js

```javascript
var { mock } = require('mockjs');

module.exports = (body) => {
  try {
    return mock(JSON.parse(body));
  } catch(e) {}
  return body;
}

```



## API 自动化测试

在 1.1.0 中增加 API 测试，通过在 raml 文件中添加 response 数据的描述，来验证 response 的数据是否符合预期。

![runner](https://ws1.sinaimg.cn/large/006tNbRwly1fyaoa2ikfeg30i60b4afa.gif)


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
          # 这里描述的商品
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



## Road Map

- [x] API 自动化测试
- [x] API 场景测试
- [x] 自动化增加前置条件，如：登录
- [ ] 测试数据导入
- [ ] Mock Server 增加请求参数验证
- [ ] baseUriParameters
- [ ] 上传文件的处理
- [ ] 读取 HTTP Archive (HAR) format 反向工程
