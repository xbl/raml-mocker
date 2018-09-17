# raml-mocker

## 初始化项目
```shell
git clone https://github.com/xbl/raml-mocker-starter.git raml-api
cd raml-api
git remote rm origin
```

```shell
yarn
# or
npm install
```
## 启动 mock server
```shell
yarn start
# or
npm start
```
### 测试
```shell
curl -i http://localhost:3000/api/v1/users/1/books/
# or
curl -i http://localhost:3000/api/v1/users/1/books/1
```
