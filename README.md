# bTeX

**bTeX** 是一个类似 LaTeX 的排版语言，它将 LaTeX 格式的源代码转换为 HTML。

## 使用方法

进行以下步骤：

* 运行 `yarn` 初始化项目文件夹。
* 运行 `yarn build` 或 `tsc` 编译项目。需要 TypeScript 版本 ≥ 4.0。
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
  "labels": {
    "foo": {
      "id": "bar",
      "html": "3.14"
    }
  },
  "errors": [],
  "warnings": []
}
```

其中

* `labels` 用于跨页面引用，以上示例表示用户输入 `\ref{foo}` 时，应显示文字 `3.14` 并链接至 `#bar` 书签。

## 测试

在 `src/main.ts` 中去掉最后一行的注释，则将编译 `test/test.btx`，并输出到 `test/test.html`。
