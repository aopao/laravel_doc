var taskList=[

];
$(".sorted_table.tree >li").each(function(selectionIndex,selectionItem){
	var selectionTitle=selectionItem.childNodes.item(2).nodeValue.trim();
	var aList=selectionItem.getElementsByTagName("a");
	for(var i=0;i<aList.length;i++){
		(function(tmpElement){
			var taskItem={
				selectionIndex:selectionIndex,
				selectionTitle:selectionTitle,
				t_title:"",
				t_link:"",
				t_name:""
			};
			taskItem.t_title=tmpElement.innerText;
			if(taskItem.t_title.length>=5){
				taskItem.t_title = taskItem.t_title.substr(0,taskItem.t_title.length-4);
			}
			taskItem.t_link=tmpElement.href;
			var urlInfos = taskItem.t_link.split("/");
			urlInfos.pop();
			taskItem.t_name = urlInfos.pop();
			taskList.push(taskItem);
		})(aList.item(i));
	}
});

var resultList = [];

function saveData()
{
	console.log("saveData");
	console.log(resultList);
	$.ajax({
		type:"POST",
		url:"http://localhost/laravel_doc/save.php",
		dataType:"json",
		data:{
			raw:JSON.stringify(resultList)
		},
		success:function(data){
			if(data.code==0){
				console.log("complete save");
			}else{
				console.log("==save error==");
				console.log(data.message);
			}
		},
		error:function(){
			console.log("==save error==");
		}
	});
}

function fetchData(fn,taskIndex=0)
{
	if(taskIndex>=taskList.length){
		console.log("complete fetch");
		fn();
		return;
	}
	var taskItem = taskList[taskIndex];
	console.log("fetch index["+taskIndex+"],total="+taskList.length);
	$.ajax({
		type:"GET",
		url:taskItem.t_link,
		dataType:"html",
		success:function(data){
			var doc=$(data);
			var docTitle=$(data).find("h1:eq(0) span").text().trim();
			var docElement=$(data).find(".markdown-body");
			docElement.find("pre code").each(function(codeIndex,codeElement){
				Prism.highlightElement(codeElement);
			});
			var docContent=docElement.html().trim();
			var resultData={
				sec_index:taskItem.selectionIndex,
				sec_title:taskItem.selectionTitle,
				t_name:taskItem.t_name,
				title:docTitle,
				content:docContent
			};
			resultList.push(resultData);
			setTimeout(function(){
				//延迟一秒抓取下次数据
				fetchData(fn,taskIndex+1);
			},Math.random()+1000);
		},
		error:function(){
			console.log("==fetch error==");
			console.log(taskItem);
		}
	});
}
fetchData(saveData);