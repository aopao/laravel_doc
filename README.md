# Laravel 中文文档构建工具

这是一个用于构建laravel中文PDF文档的工具

### 前台抓取

前往[laravel文档目录页](https://laravel-china.org/docs/laravel/5.6)，打开控制台，执行`fetch.js`中的内容

### 后台保存

抓取到的内容会被`save.php`合并保存为`all.html`

### pdf构建

最后使用calibre 的ebook-convert工具,将HTML转换为PDF版本

### 效果展示

![demo](images/demo.png)