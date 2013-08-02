(function(){
	var opacity = {
		opacityProp: false,
		getOpacityProperty: function(){
			if(this.opacityProp)
				return this.opacityProp;
			if (typeof document.body.style.opacity == 'string')
		    	return 'opacity';
		  	else if (typeof document.body.style.MozOpacity == 'string')
		    	return 'MozOpacity';
		  	else if (typeof document.body.style.KhtmlOpacity == 'string')
		    	return 'KhtmlOpacity';
		  	else if (document.body.filters && navigator.appVersion.match(/MSIE ([\d.]+);/)[1]>=5.5)
		    	return 'filter';
		  	return false;
		},
		setElementOpacity: function(elem, nOpacity){
			var opacityProp = this.opacityProp || this.getOpacityProperty();
		  	if(!elem || !opacityProp)
		  		return;
		  	if(opacityProp == 'filter'){
		    	var oAlpha = elem.filters['DXImageTransform.Microsoft.alpha'] || elem.filters.alpha;
		    	if(oAlpha)
					oAlpha.opacity = nOpacity;
		    	else
					elem.style.filter += 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + nOpacity + ')';
	  		}
		  	else
		    	elem.style[opacityProp] = nOpacity / 100;
		}
	},
	elementClass = {
		add: function(o, c){
		    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
		    if (re.test(o.className)) return
		    o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "")
		},
		remove: function(o, c){
		    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
		    o.className = o.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "")
		}
	},
	event = {
		add: function(elem, ev, fn){
			if(elem.addEventListener)
				elem.addEventListener(ev, fn, false);
			else if(elem.attachEvent)
				elem.attachEvent('on' + ev, function() { fn.apply(elem) });
			else
				elem['on' + ev] = fn;
		},
		remove: function(elem, ev, fn){
			if(elem.removeEventListener)
				elem.removeEventListener(ev, fn, false);
		  	else if (elem.detachEvent)
		    	elem.detachEvent("on" + ev, fn);
			else
				elem['on' + ev] = function(){};
		}
	},
	extend = function(obj1,obj2){
	    var obj3 = {};
	    for(var attrname in obj1){ obj3[attrname] = obj1[attrname];}
	    for (var attrname in obj2){obj3[attrname] = obj2[attrname];}
	    return obj3;
	},
	getElementType = function(element){
		if(element.nodeType != 1)
			return false;
		if(element.tagName.toLowerCase() == 'select')
			return 'select';
		else if(element.tagName.toLowerCase() == 'input')
		{
			if(element.type == 'checkbox')
				return 'checkbox';
			else if(element.type == 'radio')
				return 'radio';
		}
		else
			return false;
	}

	if(document.hasAttributes){
		var hasAttribute = function(element, name){
			return element.hasAttributes(name);
		}
	} else {
		var hasAttribute = function(element, name){
			return element.getAttribute(name) !== null;
		}
	}

	var default_params = {
		checkbox: {
			type: 'checkbox',
			styledClass: 'styled-chekbox',
			activeClass: 'styled-chekbox-active',
			onChange: function(){},
			onUnChange: function(){},
			params: {}
		},
		radio: {
			type: 'radio',
			styledClass: 'styled-radio',
			activeClass: 'styled-radio-active',
			onChange: function(){},
			onUnChange: function(){},
			params: {}
		},
		select: {
			type: 'select',
			styledClass: 'styled-select',
			onChange: function(){},
			params: {}
		}
	}

	var _customForm = {
		elements: {},
		key: {
			get: function(element){
				if(!hasAttribute(element, 'custom_form_key'))
					return false;
				var key = element.getAttribute('custom_form_key');
				if(!key || !_customForm.elements[key])
					return false;
				return key;
			},
			set: function(element){
				var key = (Math.random()*100000)+1|0;
				while(_customForm.elements[key])key = (Math.random()*100000)+1|0;
				element.setAttribute('custom_form_key', key);
				return key;
				// return ('styledForm' + Math.random()).replace( /\D/g, "");
			}
		},
		style: {
			checkbox: function(key){
				var span = document.createElement('span');
				span.className = _customForm.elements[key].styledClass;
				if(_customForm.elements[key].element.checked)
					elementClass.add(span, _customForm.elements[key].activeClass);
				opacity.setElementOpacity(_customForm.elements[key].element, 0);
				_customForm.elements[key].element.parentNode.insertBefore(span, _customForm.elements[key].element);
				span.appendChild(_customForm.elements[key].element);
				_customForm.elements[key].span = span;

				event.add(_customForm.elements[key].element, 'click', _customForm.change.checkbox);
				span = null;
			},
			radio: function(key){
				_customForm.elements[key].radiobuttons = [];
				if(_customForm.elements[key].element.name){
					var inputs = document.getElementsByName(_customForm.elements[key].element.name);
					for(var i = 0; i < inputs.length; ++i){
					    if(inputs[i].type === 'radio')
							_customForm.elements[key].radiobuttons.push(inputs[i]);
					}
				} else {
					_customForm.elements[key].radiobuttons.push(el);
				}
				var span = document.createElement('span');
				span.className = _customForm.elements[key].styledClass;
				if(_customForm.elements[key].element.checked)
					elementClass.add(span, _customForm.elements[key].activeClass);
				opacity.setElementOpacity(_customForm.elements[key].element, 0);
				_customForm.elements[key].element.parentNode.insertBefore(span, _customForm.elements[key].element);
				span.appendChild(_customForm.elements[key].element);
				_customForm.elements[key].span = span;
				event.add(_customForm.elements[key].element, 'click', _customForm.change.radio);
				span = null;
			},
			select: function(key){
				/*
				select.getAttribute("disabled")
				span.style.float = "left";
				span.style.height = el.clientHeight;
				span.style.width = el.clientWidth;
				for(var i = 0; i < styledProperties.length; ++i)
					span.style[styledProperties[i]] = getStyle(el, styledProperties[i]);
	 			getStyle = function(el, property){
					return el.style[property] || window.getComputedStyle(el, null)[property] || el.currentStyle[property] || false;
				}
				var styledProperties = ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft']*/
				var span = document.createElement('span');
				if(_customForm.elements[key].element.options.length > 0)
					span.innerHTML = _customForm.elements[key].element.options[_customForm.elements[key].element.selectedIndex].innerHTML;
				span.className = _customForm.elements[key].styledClass;
				span.style.position = "absolute";
				span.style.overflow = "hidden";
				_customForm.elements[key].element.parentNode.insertBefore(span, _customForm.elements[key].element);
				opacity.setElementOpacity(_customForm.elements[key].element, 0);
				_customForm.elements[key].element.style.position = "relative";
				_customForm.elements[key].span = span;
				event.add(_customForm.elements[key].element, 'change', _customForm.change.select);
				span = null;
			}
		},
		change: {
			checkbox: function(){
				var key = _customForm.key.get(this);
				if(this.checked)
				{
					elementClass.add(_customForm.elements[key].span, _customForm.elements[key].activeClass);
					_customForm.elements[key].onChange.call(_customForm.elements[key].element, _customForm.elements[key].params);
				}
				else
				{
					elementClass.remove(_customForm.elements[key].span, _customForm.elements[key].activeClass);
					_customForm.elements[key].onUnChange.call(_customForm.elements[key].element, _customForm.elements[key].params);
				}
			},
			radio: function(){
				var key = _customForm.key.get(this);
				var radiobuttons = _customForm.elements[key].radiobuttons;
				for(var i = 0; i < radiobuttons.length; ++i)
				{
					key = _customForm.key.get(radiobuttons[i]);
					if(!key)
						continue;
					if(radiobuttons[i].checked/* && radiobuttons[i].parentNode.className.indexOf(_customForm.elements[key].activeClass)*/)
					{
						elementClass.add(_customForm.elements[key].span, _customForm.elements[key].activeClass);
						_customForm.elements[key].onChange.call(_customForm.elements[key].element, _customForm.elements[key].params);
					}
					else
					{
						elementClass.remove(_customForm.elements[key].span, _customForm.elements[key].activeClass);
						_customForm.elements[key].onUnChange.call(_customForm.elements[key].element, _customForm.elements[key].params);
					}
				}
			},
			select: function(){
				var key = _customForm.key.get(this);
				_customForm.elements[key].span.innerHTML = _customForm.elements[key].element.options[_customForm.elements[key].element.selectedIndex].innerHTML;
				_customForm.elements[key].onChange.call(_customForm.elements[key].element, _customForm.elements[key].params);
			}
		},
		remove: {
			checkbox: function(key){
			   	_customForm.elements[key].span.parentNode.insertBefore(_customForm.elements[key].element, _customForm.elements[key].span);
				_customForm.elements[key].span.parentNode.removeChild(_customForm.elements[key].span);
				opacity.setElementOpacity(_customForm.elements[key].element, 100);
				event.remove(_customForm.elements[key].element, 'click', _customForm.change.checkbox);
				delete(_customForm.elements[key]);
			},
			radio: function(key){
			   	_customForm.elements[key].span.parentNode.insertBefore(_customForm.elements[key].element, _customForm.elements[key].span);
				_customForm.elements[key].span.parentNode.removeChild(_customForm.elements[key].span);
				opacity.setElementOpacity(_customForm.elements[key].element, 100);
				event.remove(_customForm.elements[key].element, 'click', _customForm.change.radio);
				delete(_customForm.elements[key]);
			},
			select: function(key){
				_customForm.elements[key].span.parentNode.removeChild(_customForm.elements[key].span);
				opacity.setElementOpacity(_customForm.elements[key].element, 100);
				event.remove(_customForm.elements[key].element, 'change', _customForm.change.select);
				delete(_customForm.elements[key]);
			}
		}
	}

	window.customForm = {
		style: function(element, params){

			if(_customForm.key.get(element))
				return false;
			var type = getElementType(element)
			if(!type)
				return false;
			var key = _customForm.key.set(element);
			_customForm.elements[key] = extend(default_params[type], params || {});
			_customForm.elements[key].element = element;
			_customForm.style[type].call(null, key);
			return element;
		},
		change: function(element, param){
			var key = _customForm.key.get(element);
			if(!key)
				return false;
			if(_customForm.elements[key].type == 'select')
				element.value = param;
			else
				element.checked = param;
			_customForm.change[_customForm.elements[key].type].call(element);
			return element;
		},
		remove: function(element){
			var key = _customForm.key.get(element);
			if(!key)
				return false;
			_customForm.remove[_customForm.elements[key].type](key);
			return element;
		},
		params: function(element, params){
			var key = _customForm.key.get(element);
			if(!key)
				return false;
		   if(typeof params == 'undefined')
				return _customForm.elements[key].params;

			_customForm.elements[key].params = params;
			return element;
		},
		param: function(element, name, value){

			var key = _customForm.key.get(element);
			if(!key)
				return false;

			if(typeof value == 'undefined')
				return _customForm.elements[key].params[name];

			_customForm.elements[key].params[name] = value;
			return element;
		},
		onChange: function(element, change){
			var key = _customForm.key.get(element);
			if(!key)
				return false;
			_customForm.elements[key].onChange = change;
			return element;
		},
		onUnChange: function(element, change){
			var key = _customForm.key.get(element);
			if(!key)
				return false;
			_customForm.elements[key].onUnChange = change;
			return element;
		},
		options: function(element){
			var key = _customForm.key.get(element);
			if(!key)
				return false;
			return _customForm.elements[key];
		}
	}
})()