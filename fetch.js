(function () {
    /*文档章节分组*/
    var pageGroups = [];
    var allPages = [];
    /*抓取数据缓存方式,0 永不缓存,1 localstorage缓存*/
    var cacheType = 0;
    var pageContents = [];
    var localCacheKey = "doc_cache";
    /*抓取网页的时间间隔*/
    var fetchTimeP = 1000;
    /*后端api地址*/
    var backendApi = "http://localhost/laravel_doc/save.php";

    function loadLocalCache() {
        if (localStorage.hasOwnProperty(localCacheKey)) {
            pageContents = JSON.parse(localStorage.getItem(localCacheKey));
            console.log("load content cache success !");
        }
    }

    function writeLocalCache() {
        localStorage.setItem(localCacheKey, JSON.stringify(pageContents));
        console.log("write content cache success !");
    }

    if (cacheType == 1) {
        loadLocalCache();
    }

    /**
     * 添加分组
     * @param title 分组标题
     * @param pages 子页面列表
     * @return void
     */
    function addPageGroup(title, pages) {
        pageGroups.push({title: title, pages: pages});
    }

    /**
     * 创建一个page节点
     * @param url 页面URL地址
     * @param title 页面标题
     * @param pageIndex 页面序号
     * @return {{url: string, title: string, filename: string,page_index: int};}
     */
    function createPageNode(url, title, pageIndex) {
        var matchData = url.match(/\/([^\/]+)\/\d+$/);
        var filename = matchData[1] + ".html";
        return {url: url, title: title, filename: filename, page_index: pageIndex};
    }

    /**
     * 更新变量中的html内容
     * @param pageNode
     * @param doc
     * @return string
     */
    function setContentNode(pageNode, doc) {
        var docElement = doc.find(".markdown-body");
        /*高亮*/
        docElement.find("pre code").each(function (codeIndex, codeElement) {
            Prism.highlightElement(codeElement);
        });
        docElement.find("a").each(function (linkIndex, linkElement) {
            /*不处理外部链接*/
            if (linkElement.hostname != location.hostname) {
                return;
            }
            var docUrl = location.pathname;
            if (!docUrl.endsWith("/")) {
                docUrl += "/";
            }
            /*转换文档内部绝对路径为相对路径*/
            if (linkElement.pathname.indexOf(docUrl) == 0) {
                linkElement.href = linkElement.pathname.substr(docUrl.length) + ".html" + linkElement.hash;
            }
        });
        var docContent = docElement.html().trim();
        pageContents.push({filename: pageNode.filename, content: docContent});
        return docContent;
    }

    /**
     * 进度换算
     * @param pageNode
     * @return {string}
     */
    function taskPercent(pageNode) {
        return "[" + Math.floor((pageNode.page_index + 1) * 100 / allPages.length) + "%]";
    }

    /**
     * 直接抓取页面
     * @param pageNode
     * @param successFn
     * @param errorFn
     */
    function fetchPage(pageNode, successFn, errorFn) {
        $.ajax({
            type: "GET",
            url: pageNode.url,
            dataType: "html",
            success: function (data) {
                var doc = $(data);
                var docContent = setContentNode(pageNode, $(data));
                console.log(taskPercent(pageNode) + "抓取《" + pageNode.title + "》(" + pageNode.filename + ")成功");
                setTimeout(function () {
                    //延迟
                    successFn(pageNode, docContent);
                }, Math.random() + fetchTimeP );
            },
            error: function () {
                errorFn(pageNode);
            }
        });
    }

    /**
     * 加载页面数据(可能使用缓存)
     * @param pageNode
     * @param successFn
     * @param errorFn
     */
    function loadPageContent(pageNode, successFn, errorFn) {
        if (cacheType == 0) {
            fetchPage(pageNode, successFn, errorFn);
        } else if (cacheType == 1) {
            if (pageContents.length > pageNode.page_index) {
                /*存在缓存数据*/
                successFn(pageNode, pageContents[pageNode.page_index]);
            } else {
                fetchPage(pageNode, successFn, errorFn);
            }
        }
    }

    function saveDoc() {
        $.ajax({
            type: "POST",
            url: backendApi,
            dataType: "json",
            data: {
                type: "doc",
                raw: JSON.stringify(pageGroups)
            },
            success: function (data) {
                if (data.code == 0) {
                    console.log("保存文档结构成功");
                    console.log("all completed !!!");
                } else {
                    console.error("保存文档结构失败: " + data.message);
                }
            },
            error: function () {
                console.error("保存文档结构失败: ajax出错");
            }
        });
    }

    /**
     * 页面数据加载成功之后,发送到后端保存
     * @param pageNode
     * @param pageContent
     */
    function sendPageToBackend(pageNode, pageContent) {
        $.ajax({
            type: "POST",
            url: backendApi,
            dataType: "json",
            data: {
                filename: pageNode.filename,
                title: pageNode.title,
                content: pageContents[pageNode.page_index].content
            },
            success: function (data) {
                if (data.code == 0) {
                    console.log(taskPercent(pageNode) + "保存《" + pageNode.title + "》(" + pageNode.filename + ")成功");
                    //保存下一个page
                    savePage(pageNode.page_index + 1);
                } else {
                    console.error("保存《" + pageNode.title + "》(" + pageNode.filename + ")失败: " + data.message);
                }
            },
            error: function () {
                console.error("保存《" + pageNode.title + "》(" + pageNode.filename + ")失败：ajax出错");
            }
        });
    }

    function savePage(pageIndex) {
        if (pageIndex < allPages.length) {
            loadPageContent(allPages[pageIndex], sendPageToBackend, function (pageNode) {
                console.error("抓取《" + pageNode.title + "》(" + pageNode.filename + ")失败");
            });
        }
        else if (pageIndex == allPages.length) {
            writeLocalCache();
            //最后一个page抓取完毕,准备发送文档结构
            console.log("正在保存文档结构...");
            saveDoc();
        }
    }

    console.log("started");
    //读取基本结构
    $(".sorted_table.tree >li").each(function (selectionIndex, selectionItem) {
        var pageGroupTitle = selectionItem.childNodes[2].nodeValue.trim();
        var topicPages = [];
        var pageLinks = selectionItem.getElementsByTagName("a");
        for (var i = 0; i < pageLinks.length; i++) {
            (function (linkIndex, linkElement) {
                var pageIndex = i;
                for (var groupIndex in pageGroups) {
                    pageIndex += pageGroups[groupIndex].pages.length;
                }
                var pageTitle = linkElement.innerText;
                if (pageTitle.endsWith(" 已完成")) {
                    pageTitle = pageTitle.substr(0, pageTitle.length - 4);
                }
                var pageNode = createPageNode(linkElement.href, pageTitle, pageIndex);
                allPages.push(pageNode);
                topicPages.push(pageNode);
            })(i, pageLinks.item(i));
        }
        addPageGroup(pageGroupTitle, topicPages);
    });
    console.log(allPages.length + " pages total");
    //console.log(pageGroups);
    //console.log(allPages);
    savePage(0);

})();