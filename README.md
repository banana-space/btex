# bTeX

**bTeX** 是一个类似 LaTeX 的排版语言，它将 LaTeX 格式的源代码转换为 HTML。

## 使用方法

进行以下步骤：

* 运行 `yarn` 初始化项目文件夹。
* 运行 `yarn build` 编译项目。
* 运行 `yarn start` 或 `node ./dist/main.js` 启动本地服务器。

bTeX 将运行于本地端口 `7200`。向该端口发送 `POST` 请求以运行编译器，格式如下：

``` http
POST http://127.0.0.1:7200
Content-Type: application/json

{
  "code": "要编译的代码"
}
```

可选参数：

* `"inverseSearch": boolean`，指定是否包含反向搜索信息，默认 `false`。

响应格式如下：

``` http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "html": "<div class=\"btex-output\"> ... </div>",
  "data": {},
  "errors": [],
  "warnings": []
}
```

其中

* `data` 包含跨页面引用、子页面等数据。

## 测试

在 `src/main.ts` 中去掉最后一行的注释，则将编译 `test/test.btx`，并输出到 `test/test.html`。
