<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: X-PINGOTHER, Content-Type');
header('Content-Type: application/json; charset=utf-8');
$savePath='./html_files';
$debug=false;
if(!is_dir($savePath)){
	mkdir($savePath);
}
$postData=json_decode($_POST['raw'],true);
$tocArr=[];
function saveToFile($path,$content)
{
	$p=@file_put_contents($path,$content);
	if($p===false){
		$result=['code'=>-1,'message'=>'写入文件'.$path.'失败'];
		echo json_encode($result);
		exit();
	}
}
$tocContent=file_get_contents('toc.html');
if($debug){
	$dIndex=0;
}
foreach($postData as $itemNode){
	if($debug){
		$dIndex++;
		if($dIndex>6){
			break;
		}
	}
	$content=$itemNode['content'];
	$content=preg_replace('@href="(/docs/laravel/5.6/)([^"#]+)(#[^"]+)?"@','href="\2.html\3"',$content);
	$content='<div name="chapter_'.$itemNode['t_name'].'" class="ui readme markdown-body content-body">'.$content.'</div>';
	$groupIndex = $itemNode['sec_index'];
	if(!isset($tocArr[$groupIndex])){
		$tocArr[$groupIndex]=[
			'name'=>$itemNode['sec_title'],
			'list'=>[]
		];
	}
	$tocArr[$groupIndex]['list'][]=[
		'title'=>$itemNode['title'],
		't_name'=>$itemNode['t_name']
	];
	$tplContent=@file_get_contents($savePath.'/../tpl.html');
	$tplContent=str_replace(
		['{title}','{content}'],
		[$itemNode['title'],$content],
		$tplContent
	);
	$itemSavePath=$savePath.'/'.$itemNode['t_name'].'.html';
	saveToFile($itemSavePath,$tplContent);
}
if($debug){
	$outputPath=$savePath.'/debug.html';
}else{
	$outputPath=$savePath.'/all.html';
}
$tocListHtml='';
foreach($tocArr as $tocGroup){
	$groupHtml="\t\t".'<li class="toc-group toc-item">
			<span class="toc-title">'.$tocGroup['name'].'</span>
			<ol>'.PHP_EOL;
	foreach($tocGroup['list'] as $listNode){
		$groupHtml.=("\t\t\t\t".'<li class="toc-item"><a href="'.$listNode['t_name'].'.html">'.$listNode['title'].'</a></li>'.PHP_EOL);
	}
	$groupHtml.="\t\t\t".'</ol>
		</li>';
	$tocListHtml.=$groupHtml;
	$tocListHtml.=PHP_EOL;
}
$tocContent=str_replace('{list}',$tocListHtml,$tocContent);
saveToFile($outputPath,$tocContent);
$result=['code'=>0,'message'=>'success'];
echo json_encode($result);
