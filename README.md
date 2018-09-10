# Laravel 中文文档构建工具

这是一个用于构建laravel中文PDF文档的工具

### 前台抓取

前往[laravel文档目录页](https://laravel-china.org/docs/laravel/5.6)，打开控制台，复制`fetch.js`中的内容到控制台执行

### 后台保存

抓取到的内容会通过ajax请求，发送到后端的`save.php`,并保存为`all.html`

> 可在js文件中修改后端api地址,默认后端地址为 `http://localhost/laravel_doc/save.php`

### pdf构建

最后双击build.bat，将调用[calibre](https://calibre-ebook.com/download) 的ebook-convert命令行工具,将HTML转换为PDF版本

### 效果展示

![demo](images/demo.png?v=2333)

### 如何保存laravel-china的其它文档?

先删除本地生成的数据目录 `html_files`, 修改 `fetch.js` 中的文档名称(docName变量的值)。

然后用 chrome 打开laravel-china某个文档的目录页，打开控制台，复制进去执行，等待抓取保存。

保存完毕之后双击 `build.bat` 构建PDF文档。

### 所需环境

- php
- php需开启mbstring扩展
- 本地web服务器(nginx或者Apache、IIS都可以)

### 可能出现的问题
   
>'ebook-convert' 不是内部或外部命令，也不是可运行的程序或批处理文件。

安装[calibre](https://calibre-ebook.com/download) ,其安装目录下,有一个 `ebook-convert.exe`，把此文件所在的目录
加入系统 `path` 环境变量即可。

>DOMException: Failed to execute 'setItem' on 'Storage' ...

清理浏览器的localstorage缓存后重试。

>保存《...》(....html)失败：ajax出错

查看一下是否把本程序部署到了正确的目录, 默认情况下,文档数据会被发送给 `http://localhost/laravel_doc/save.php` 进行保存。