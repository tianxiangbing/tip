# tip
提示组件
效果如下图:
![tip效果图](example/tip.jpg)
**[DEMO请案例点击这里查看.](http://www.lovewebgames.com/jsmodule/tip.html "tip demo")**

----------

#调用示例
	<table style="width:100%;"><tr>
		<td>
			<input type="button" value="右边hover" id="btn-tip-right">
		</td>
		<td>
			<input type="button" value="左边click" id="btn-tip-left">
		</td>
		<td>
			<input type="button" value="上边click" id="btn-tip-top">
		</td>
		<td>
			<input type="button" value="下边click" id="btn-tip-bottom">
		</td>
		<td align="right">
			<input type="button" value="按边界click自动" id="btn-tip-auto">
		</td>
	</tr></table>
	文本提示：<input type="text" id="txt-tip" msg="请输入内容">
	<script type="text/javascript" src="../src/jquery-1.11.2.js"></script>
	<script type="text/javascript" src="../src/tip.js"></script>
	<script>
	var tip = new Tip();
	tip.init({
		trigger: '#btn-tip-right',
		width:100,
		triggerEvent:'hover',
		content: 'loading...',
		ajax: function() {
			var dtd = $.Deferred(); // 新建一个deferred对象
			var wait = function(dtd) {
				var tasks = function() {
					console.log("执行完毕！");
					dtd.resolve("这是提示信息啊这是提示信息啊这是提示信息啊这是提示信息啊这是提示信息啊这是提示信息啊"); // 改变deferred对象的执行状态
				};
				setTimeout(tasks, 1000);
				return dtd;
			};
			wait(dtd);
			return dtd;
		}
	});
	var tip_left= new Tip();
	tip_left.init({
		trigger:'#btn-tip-left',
		triggerEvent:'click',
		content: '这是提示信息啊',
		position:'left'
		});
	var tip_top= new Tip();
	tip_top.init({
		trigger:'#btn-tip-top',
		triggerEvent:'click',
		content: '这是提示信息啊',
		position:'top'
		});
	var tip_bottom= new Tip();
	tip_bottom.init({
		trigger:'#btn-tip-bottom',
		triggerEvent:'click',
		content: '这是提示信息啊',
		position:'bottom'
		});
	var tip_auto= new Tip();
	tip_auto.init({
		trigger:'#btn-tip-auto',
		triggerEvent:'click',
		width:100,
		content: '这是提示信息啊这是提示信息啊这是提示信息啊',
		inViewport:true
		});
	var t = $('#txt-tip').Tip({
		content:$('#txt-tip').attr('msg'),
		triggerEvent:'focus'
	})[0];
	</script>

#API
##属性
###trigger:`[$|dom|string]`
	触发元素,jquery对象或dom或string
###triggerEvent: `[click|hover|focus]`
	触发事件，默认为hover,事件都委托在delegate参数上，focus不委托
###delegate:`[dom|string]`
	事件的委托节点,默认委托到body,focus无效.
###tpl:`[string]`
	html模板，默认<div class="ui-tip"><div class="ui-tip-content"></div><div class="ui-tip-arrow"><i></i><em></em></div></div>
###offset:`{x:0,y:0}`
	偏移量,默认x:0,y:0
###width:`[number]`
	宽
###height:`[number]`
	高
###zIndex:`999`
	z-index
###content:[string|$]
	提示内容，这里可以是string或节点，因为内部是调用的$().html方法,动态设置请调setContent方法
###inViewport:`bool`
	是否自适合窗口位置,默认false
###position:`['right'|'left'|'top'|'bottom']`
	显示位置，默认'right
###ajax:`function`
	返回一个promise,参数为promise之后的内容如下：
	ajax: function() {
		var dtd = $.Deferred(); // 新建一个deferred对象
		var wait = function(dtd) {
			var tasks = function() {
				console.log("执行完毕！");
				dtd.resolve("这是提示信息啊"); // 改变deferred对象的执行状态
			};
			setTimeout(tasks, 1000);
			return dtd;
		};
		wait(dtd);
		return dtd;
	}
##方法
###setContent:`function(content)`
	设置提示内容
###stop:`function()`
	停止显示
###start:`function`
	开始显示
##事件或回调
###callback:`function`
	显示时的回调