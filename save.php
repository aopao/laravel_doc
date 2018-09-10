<?php
/**
 * Created by PhpStorm.
 * User: liuguang
 * Date: 2018/9/9
 * Time: 14:13
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: X-PINGOTHER, Content-Type');
header('Content-Type: application/json; charset=utf-8');
/**
 * 错误响应
 * @param string $message 错误内容
 * @return void
 */
function sendErrorResponse($message)
{
    echo json_encode(['code' => -1, 'message' => $message, 'data' => null]);
    exit();
}

/**
 * 成功响应
 * @param mixed $data 数据
 * @return void
 */
function sendSuccessResponse($data = null)
{
    echo json_encode(['code' => 0, 'message' => 'ok', 'data' => $data]);
    exit();
}

//只接受POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendErrorResponse('not POST method !');
}
//读取模板文件
$saveDir = __DIR__ . '/./html_files/';
if (!is_dir($saveDir)) {
    if (@mkdir($saveDir) === false) {
        sendErrorResponse('创建文件夹 ' . $saveDir . ' 失败');
    }
}
$tplContent = @file_get_contents(__DIR__ . '/./inc/tpl.html');
if ($tplContent === false) {
    sendErrorResponse('读取文件 tpl.html 失败');
}
$tocContent = @file_get_contents(__DIR__ . '/./inc/toc.html');
if ($tocContent === false) {
    sendErrorResponse('读取文件 toc.html 失败');
}
/**
 * 处理页面HTML的保存
 * @param string $filename html文件名
 * @param string $title 标题
 * @param string $content 文件内容
 * @return void
 * @throws \Exception
 */
function processSavePage($filename, $title, $content)
{
    global $saveDir, $tplContent;
    $savePath = $saveDir . $filename;
    $content = '<div class="ui readme markdown-body content-body">' . $content . '</div>';
    $content = str_replace(
        ['{title}', '{content}'],
        [$title, $content],
        $tplContent);
    $op = @file_put_contents($savePath, $content);
    if ($op === false) {
        throw new \Exception('保存文件' . $filename . '失败');
    }
}

/**
 * 处理文档目录页生成
 * @param array $groups
 * @param string $docName
 * @throws Exception
 */
function processSaveDoc($groups, $docName)
{
    global $saveDir, $tocContent;
    $savePath = $saveDir . 'all.html';
    $tocListHtml = '';
    foreach ($groups as $tocGroup) {
        $groupHtml = "\t\t" . '<li class="toc-group toc-item">
			<span class="toc-title">' . $tocGroup['title'] . '</span>
			<ol>' . PHP_EOL;
        foreach ($tocGroup['pages'] as $pageNode) {
            $groupHtml .= ("\t\t\t\t" . '<li class="toc-item"><a href="' . $pageNode['filename'] . '">' . $pageNode['title'] . '</a></li>' . PHP_EOL);
        }
        $groupHtml .= "\t\t\t" . '</ol>
		</li>';
        $tocListHtml .= $groupHtml;
        $tocListHtml .= PHP_EOL;
    }
    $content = str_replace(['{list}', '{title}'], [$tocListHtml, $docName], $tocContent);
    $op = @file_put_contents($savePath, $content);
    if ($op === false) {
        throw new \Exception('保存文件' . $savePath . '失败');
    }
    $op = @file_put_contents($saveDir . '../inc/toc_name.txt', mb_convert_encoding($docName, 'GBK', 'UTF-8'));
    if ($op === false) {
        throw new \Exception('保存文档名称失败');
    }
}

$actionType = '';
if (isset($_POST['type'])) {
    $actionType = $_POST['type'];
}
if ($actionType == 'doc') {
    //保存文档目录结构
    try {
        $docName = '未知文档';
        if (isset($_POST['doc_name'])) {
            $docName = $_POST['doc_name'];
        }
        processSaveDoc(json_decode($_POST['raw'], true), $docName);
        sendSuccessResponse();
    } catch (\Exception $e) {
        sendErrorResponse($e->getMessage());
    }
} else {
    //保存文档的某个页面
    try {
        processSavePage($_POST['filename'], $_POST['title'], $_POST['content']);
        sendSuccessResponse();
    } catch (\Exception $e) {
        sendErrorResponse($e->getMessage());
    }
}