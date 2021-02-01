/*
 * Created with Sublime Text 3.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: 田想兵
 * github: https://github.com/tianxiangbing/tip.git
 * Date: 2015-06-12
 * Time: 17:34:25
 * Contact: 55342775@qq.com
 */
(function(root, factory) {
	//amd
	if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.Tip = factory();
	}
})(this, function() {
	$.fn.Tip = function(settings) {
		var arr = [];
		$(this).each(function() {
			var options = $.extend({
				trigger: this
			}, settings);
			var tip = new Tip();
			tip.init(options);
			arr.push(tip);
		});
		return $(arr);
	};

	function Tip() {
		var rnd = Math.random().toString().replace('.', '');
		this.id = 'Tip_' + rnd;
	}
	$(document).click(function(){
		$('.ui-tip').trigger('hide');
	});
	Tip.prototype = {
		init: function(settings) {
			this.settings = $.extend({
				trigger: '',
				status: 'hide',
				callback: null,
				tpl: '<div class="ui-tip"><div class="ui-tip-content"></div><div class="ui-tip-arrow"><i></i><em></em></div></div>',
				triggerEvent: 'hover',
				rightMouseTarget : '.jqgrow',
				offset: {
					x: 0,
					y: 0
				},
				width: 'auto',
				height: 'auto',
				zIndex: 999,
				content: '',
				inViewport: true,
				delegate: null,
				position: 'right', //top||left||bottom||right,bottom|left/center/right
				ajax: null //deffered
			}, settings);
			this.status = this.settings.status;
			this._getPos();
			this.bindEvent();
		},
		_getPos: function() {
			this.position = this.position || this.settings.position.split('|')[0];
			this.arrowPosition = this.settings.position.split('|')[1] || "center";
		},
		bindEvent: function() {
			var _this = this;
			var delegate = this.settings.delegate;
			var trigger = this.settings.trigger;
			if (!delegate) {
				delegate = this.settings.trigger;
				trigger = null;
			}
			if (this.settings.triggerEvent == 'click') {
				$(delegate).on(this.settings.triggerEvent, trigger, function(e) {
					_this.trigger = this;
					_this.hide();
					_this.show();
					e.stopPropagation();
				});
			} else
			if (this.settings.triggerEvent == "hover") {
				var hovertimer = null;
				$(delegate).on('mouseover', trigger, function() {
					_this.trigger = this;
					_this.show();
					$(_this.tip).hover(function() {
						clearTimeout(hovertimer);
					}, function() {
						_this.hide();
					});
				}).on('mouseout', trigger, function() {
					_this.trigger = this;
					hovertimer = setTimeout(function() {
						_this.hide();
					}, 500)
				});
			} else if (this.settings.triggerEvent) {
				$(this.settings.trigger).on(this.settings.triggerEvent, function() {
					_this.show();
				});
			}
			if(this.settings.rightMouseTarget){
				$(delegate).on('contextmenu',this.settings.rightMouseTarget,function(e){
					if(e.button==2){
						//鼠标右键
						_this.e = e;
						_this.trigger = $(this).find(_this.settings.trigger);
						if (_this.status == "hide") {
							_this.show();
						} else
						if (_this.status == "show") {
							_this.hide();
						}
						e.stopPropagation();
						e.preventDefault();
						e.returnValue = false; // 解决IE8右键弹出
						e.cancelBubble = true;
					}
				})
			}
		},
		show: function() {
			var _this = this;
			this.settings.beforeShow && this.settings.beforeShow.call(this);
			if (!this.tip) {
				this.tip = $(this.settings.tpl);
				this.tipcontent = this.tip.find('.ui-tip-content');
				this.tiparrow = this.tip.find('.ui-tip-arrow');
				$('body').append(this.tip);
				this.tip.on('hide', function() {
					_this.hide();
				})
			}
			this.tip.show().css({
				zIndex: this.settings.zIndex
			});
			this.tipcontent.css({
				height: this.settings.height,
				width: this.settings.width
			});
			if(typeof this.settings.content == 'function'){
				this.setContent(this.settings.content.call(this,this.trigger));
			}else{
				this.setContent(this.settings.content);
			}
			if (this.settings.ajax) {
				this.settings.ajax(this.trigger).done(function(content) {
					_this.setContent(content);
					_this.b = false;
					_this.status = 'show';
					_this.start();
					_this.setPosition();
				})
			}else{
				if(this.tip){
                    this.initPos = {x:this.tip.x, y:this.tip.y};
                    this.status = 'show';
                    this.start();
                    this.setPosition();
				}
			}
			//这里保存一份target的相对初始位置,用来判断是否有偏移
			this.initPos = this.getTargetPosition();
			this.settings.callback && this.settings.callback.call(this);
		},
		//这里保存一份target的相对初始位置,用来判断是否有偏移
		getTargetPosition:function(){
			var targetPos = $(this.trigger).offset();
			return targetPos;
		},
		hide: function() {
			$(this.tip).remove();
			this.tip = undefined;
			this.position = undefined;
			this.status = 'hide';
			this.e = undefined;
			this.stop();
			this.b = false;
			this._getPos();
			this.initPos = undefined;
			this.settings.afterHide && this.settings.afterHide.call(this);
		},
		start: function() {
			var _this = this;
			$(window).resize(function() {
				_this._getPos();
				_this.b = false;
				_this.setPosition();
			})
			// .scroll(function() {
				// _this._getPos();
				// _this.b = false;
				// _this.setPosition();
			// });
			this._timer && clearInterval(this._timer);
			this._timer = setInterval(function() {
				// if(Math.abs(_this.tip.y-_this.initPos.y)>10 ||  Math.abs(_this.tip.x-_this.initPos.x)>10){
				// 	_this.hide();
				// 	console.log(2)
				// }else{
					_this.setPosition();
					// console.log(3)
				// }
			}, 100);
		},
		setClass:function(forward){
			if(!this.tip.hasClass(forward)){
				this.tip.attr('class', 'ui-tip '+forward);
			}
		},
		setPosition: function() {
			var b = this.b;
			// console.log(4,b)
			// if(!b)debugger;
			var _this = this;
			if (!this.tip || this.tip.size() == 0) return;
			let newPosition=this.getTargetPosition();
			if(_this.initPos && (Math.abs( Number(_this.initPos.left) - Number(newPosition.left))>10 ||  
			 Math.abs( Number(_this.initPos.top) - Number(newPosition.top))>10) ){
					_this.hide();
			}
			if($(this.trigger).filter(':visible').size()==0){
				this.tip.hide();
				return false;
			}else if(this.tip){
				this.tip.show();
			}
			var targetPos = $(_this.trigger).offset();
			if(this.settings.rightMouseTarget &&this.e && this.e.type == 'contextmenu'){
				targetPos = {left:this.e.pageX,top:this.e.pageY};
			}
			var targetWH = {
				h: $(_this.trigger).outerHeight(),
				w: $(_this.trigger).outerWidth()
			};
			var tipWH = {
				w: this.tip.outerWidth(),
				h: this.tip.outerHeight()
			}
			this.tip.attr('class', 'ui-tip');
			switch (_this.position) {
				case "left":
					{
						var y = 0,
							arrowy = 0;
						if (this.arrowPosition == "top") {
							y = +_this.settings.offset.y;
							arrowy = 10;
						} else if (this.arrowPosition == "bottom") {
							y = _this.settings.offset.y - tipWH.h + targetWH.h;
							arrowy = tipWH.h - 22;
						} else {
							y = _this.settings.offset.y - (tipWH.h - targetWH.h) / 2;
							arrowy = tipWH.h / 2 - 6;
						}
						this.tiparrow.y = arrowy;
						this.tiparrow.x = tipWH.w - 2;
						this.tip.x = targetPos.left - tipWH.w + _this.settings.offset.x - 10;
						this.tip.y = targetPos.top + _this.settings.offset.y + y;
						this.setClass('arrow-left');
						this._overScreen();
						break;
					}
				case "top":
					{
						var x = 0,
							arrowx = 0;
						if (this.arrowPosition == "left") {
							x = 0;
							arrowx = 10;
						} else if (this.arrowPosition == "right") {
							x = +targetWH.w - tipWH.w;
							arrowx = tipWH.w - 22;
						} else {
							x = -(tipWH.w - targetWH.w) / 2;
							arrowx = tipWH.w / 2 - 6;
						}
						this.tiparrow.y = tipWH.h - 2;
						this.tiparrow.x = arrowx;
						this.tip.x = targetPos.left + _this.settings.offset.x + x;
						this.tip.y = targetPos.top - tipWH.h + _this.settings.offset.y + 10;
						this.setClass('arrow-top');
						this._overScreen();
						break;
					}
				case "bottom":
					{
						var x = 0,
							arrowx = 0;
						if (this.arrowPosition == "left") {
							x = 0;
							arrowx = 10;
						} else if (this.arrowPosition == "right") {
							x = +targetWH.w - tipWH.w;
							arrowx = tipWH.w - 22;
						} else {
							x = -(tipWH.w - targetWH.w) / 2;
							arrowx = tipWH.w / 2 - 6;
						}
						this.tiparrow.y = -6;
						this.tiparrow.x = arrowx;
						this.tip.x = targetPos.left  + _this.settings.offset.x + x;
						this.tip.y = targetPos.top + targetWH.h + _this.settings.offset.y + 10
						this.setClass('arrow-bottom');
						this._overScreen();
						break;
					}
				default:
					{ //right
						var y = 0,
							arrowy = 0;
						if (this.arrowPosition == "top") {
							y += _this.settings.offset.y;
							arrowy = targetWH.h/2 - 6;
						} else if (this.arrowPosition == "bottom") {
							y = _this.settings.offset.y - tipWH.h + targetWH.h;
							arrowy = tipWH.h - targetWH.h/2 - 6;
						} else {
							y = _this.settings.offset.y - (tipWH.h - targetWH.h) / 2;
							arrowy = tipWH.h / 2 - 6;
						}
						this.tip.x = targetWH.w + targetPos.left + 10;
						this.tip.y = targetPos.top + y;
						this.setClass('arrow-right');
						this.tiparrow.y = arrowy;
						this.tiparrow.x = -6;
						this._overScreen();
						break;
					}
			}
			if (!this.settings.inViewport) {
				// this._setPosition();
			}
		},
		stop: function() {
			clearInterval(this._timer);
			$(window).off("resize").off('scroll');
		},
		_overScreen: function() {
			// console.log(this.position,'o')
			var winXY = {
				y: $(window).scrollTop(),
				x: $(window).scrollLeft()
			};
			var winWH = {
				w: $(window).width(),
				h: $(window).height()
			};
			if (this.settings.inViewport && !this.b) {
				this.b = true;
				if (this.tip.x - winXY.x < 0) {
					if (this.position == "left") {
						this.position = "right";
					} else {
						this.arrowPosition = "left";
					}
				}
				if (this.tip.y < winXY.y) {
					if (this.position == "top") {
						this.position = "bottom";
					} else {
						this.arrowPosition = "top";
					}
				}
				if (this.tip.y + this.tip.outerHeight() > winWH.h + winXY.y) {
					if (this.position == "bottom") {
						this.position = "top";
					} else {
						this.arrowPosition = "bottom";
					}
				}
				if (this.tip.x + this.tip.outerWidth() > winXY.x + winWH.w) {
					if (this.position == "right") {
						this.position = "left";
					} else {
						this.arrowPosition = "right";
					}
				}
				this.setPosition();
			}
			this._setPosition();
		},
		tolerance:function(a,b){
			return Math.abs(a-b)>2;
		},
		_setPosition: function() {
			if(this.tolerance(this.tip.offset().left,this.tip.x)||this.tolerance(this.tip.offset().top,this.tip.y)){
				this.tip.css({
					left: this.tip.x,
					top: this.tip.y
				});
			}
			if(this.tolerance(this.tiparrow.offset().left,this.tiparrow.x)||this.tolerance(this.tiparrow.offset().top,this.tiparrow.y)){
				this.tiparrow.css({
					top: this.tiparrow.y,
					left: this.tiparrow.x
				});
			}
		},
		setContent: function(content) {
            this.tipcontent.html(content);
            this.setPosition();
		}
	}
	return Tip;
});