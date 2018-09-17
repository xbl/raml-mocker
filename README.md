# Raml-mocker

Raml-mocker 是基于 [Raml](https://raml.org/) 的 mock server，Raml 是 RESTfull API 描述语言，同时支持自定义指令。raml-mocker 可以根据 raml 描述文档读取到 API 中的 uri 及 response 中的 example 继而生成 mock server。

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
#### 启动 mock server
```shell
yarn start
# or
npm start
```
#### 测试
```shell
curl -i http://localhost:3000/api/v1/users/1/books/
# or
curl -i http://localhost:3000/api/v1/users/1/books/1
```

### 生成 API 可视化文档

```shell
yarn run build
# or
npm run build
```

此功能使用了[raml2html](https://www.npmjs.com/package/raml2html)。



## 配置 .raml-config.json

```json
{
  "controller": "./controller",  // controller 路径
  "raml": "./api.raml", // raml 文档入口
  "port": 3000 // mock server 服务端口号
}
```






## 入门篇：Mock Server

raml-mocker 可以不写 js 代码生成Mock Server，只需要在response 添加 example:

```yaml
/books:
  /:id:
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