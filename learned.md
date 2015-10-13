,,,
发送表情的字符串转换处理

	var realMsg = msg.replace(/<{([a-z]+)}>/g, function(match){
        return "<img src='/emoji/" + match.slice(2, -2) + ".gif' class='emojied'>";
    });


- str的relpace函数`str.replace(search, replacement)`参数为搜索模式和替换内容，第二个参数可为一个函数。
- 正则的`g`属性表示匹配多个元素。
html的微数据属性命名不要使用大写，读取时会被统一转化成小写
	
		<span data-targetid="1"></span> //√
		<span data-targetId="1"></span> //×


