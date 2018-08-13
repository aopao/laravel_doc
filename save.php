<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: X-PINGOTHER, Content-Type');
header('Content-Type: application/json; charset=utf-8');
$savePath='.';
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
$allHtml='';
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
	$content=preg_replace_callback('@href="(/docs/laravel/5.6/)([^"#]+)(#[^"]+)?"@',function($match){
		if(isset($match[3])){
			$target=$match[3];
		}else{
			$target='#chapter_'.$match[2];
		}
		return 'href="'.$target.'"';
	},$content);
	$content='<div name="chapter_'.$itemNode['t_name'].'" class="ui readme markdown-body content-body">'.$content.'</div>';
	$allHtml.=($content.PHP_EOL);
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
}
$tplContent=@file_get_contents($savePath.'/tpl.html');
$tplContent=str_replace('{content}',$allHtml,$tplContent);
if($debug){
	$outputPath=$savePath.'/debug.html';
}else{
	$outputPath=$savePath.'/all.html';
}
saveToFile($outputPath,$tplContent);
$result=['code'=>0,'message'=>'success'];
echo json_encode($result);
