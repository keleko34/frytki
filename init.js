/*
  Need to handle:
  - set, add and remove properties
  - all mutatable array methods
  - multidimensional arrays and objects
  - json parsing
  - combine arrays and objects as one type `MIXED`
*/

"use strict";

window.frytki = (function(){
  
  /* SCOPED LOCALS */
  /* REGION */
  
  /* items that should not be injected as they disrupt key actions */
  var __blocked__ = [
    'Symbol','constructor','__proto__','stop','length'
  ],
  
  __ObjectTypes__ = [
    'Frytki','Object','Array'
  ],
      
  /* allows listening for all changes no matter what it is */
  __all__ = '*';
  
  /* SCOPED LOCALS */
  /* ENDREGION */
  
  /* DESCRIPTOR LOCALS */
  /* REGION */
  
  var __slice = Array.prototype.slice,
      __sort = Array.prototype.sort,
      __splice = Array.prototype.splice,
      __shift = Array.prototype.shift,
      __reverse = Array.prototype.reverse,
      __pop = Array.prototype.pop,
      __toString = Object.prototype.toString,
      __typeof = (function(){
        
        var __getTypeof = ({}).toString;
        
        return function(obj) {
          return ((obj || this) instanceof Frytki ? "[object Frytki]" : __getTypeof.call((obj || this))).replace(/[\[\]]|(object\s)/g,'');
        }
      }()),
      __keys = (function(){
        
        var __getKeys = Object.keys;
        
        return function(obj, type){
          return __getKeys(obj)
          .filter(function(v){
            if(__blocked__.indexOf(v) !== -1) return false;
            if(!type) return true;
            if(type === 'object' || type === 'o') return (!isNaN(parseInt(v,10)));
            return isIndex(v);
          })
        }
      }());
      
  
  /* DESCRIPTOR LOCALS */
  /* ENDREGION */
  
  /* OBJECT CLASSES */
  /* REGION */
  
  /* The event object that gets passed to each listener */
  function changeEvent(value,oldValue,target,attr,args,action,srcObject,type,stop,cancelable,bubbles)
  {
    /* stops bubbling of event */
    this.stopPropagation = function()
    {
      this.bubbles = false;
      this.__stopPropogation__ = !this.bubbles;
    };
    
    /* stops event */
    this.stopImmediatePropagation = function()
    {
      this.bubbles = false;
      this.__stopImmediatePropogation__ = this.__stopPropogation__ = !this.bubbles;
    };
    
    /* prevent the default action */
    this.preventDefault = function()
    {
      this.__preventDefault__ = this.defaultPrevented = true;
    };
    
    /* stop the update listeners from firing */
    this.stop = function()
    {
      this.target.__frytkiExtensions__.stop = this.stopped = true;
    }
    
    /* if the event can be cancelled (not implemented) */
    this.cancelable = (cancelable || true);
    
    /* if default was prevented (not implemented) */
    this.defaultPrevented = false;
    
    /* if the event can bubble */
    this.bubbles = (bubbles || true);
    
    /* the current value of the property */
    this.value = value;
    
    /* the old value of the property */
    this.oldValue = oldValue;
    
    /* the target node the event is being ran on */
    this.target = target;
    
    /* the name of the property */
    this.attr = attr;
    
    /* passed arguments if the property was a method */
    this.arguments = args;
    
    /* the returned result of running that method (update only) */
    this.action = action;
    
    /* the original element that fired the event */
    this.srcObject = srcObject;
    
    /* the name of the listener, can be: `set`, `update`, `create`, `delete` */
    this.type = type;
    
    /* default stopped telling if update listeners should be stopped */
    this.stopped = false;
    
    /* the parent of this object if any */
    this.parent = this.target.__frytkiExtensions__.immediateParent;
    
    /* tells if the update listeners have been stopped or not */
    if(stop) this.target.__frytkiExtensions__.stop = this.stopped = true;
  }
  
  /* This holds all listeners associated with a particular element */
  function localBinders(hash, ref, base, scope, parent, lengthSet)
  {
    var extensions = (base.__frytkiExtensions__),
        descriptor = (extensions ? Object.getOwnPropertyDescriptor(extensions, 'base') : undefined);
  
    /* the title for the object */
    Object.defineProperties(this,{
      /* base object */
      base: (descriptor ? (descriptor.get ? descriptor : descriptorPointer(extensions, 'base')) : descriptorSimple(base)),
      
      /* title of this data set */
      hash: (descriptor ? (descriptor.get ? Object.getOwnPropertyDescriptor(extensions, 'hash') : descriptorPointer(extensions, 'hash')) : descriptorSimple(hash))
    })
    
    /* a refrence to this object */
    this.ref = ref;
    
    /* the scope in string format to easily travel up and down the tree */
    this.scope = scope;
    
    /* the immediate parent of this object */
    this.immediateParent = parent;
    
    /* pointers located in this object */
    this.pointers = {};
    
    /* node's property listeners */
    this.attrListeners = {};
    
    /* node's property update listeners */
    this.attrUpdateListeners = {};
    
    /* any bubbled property listeners */
    this.parentAttrListeners = {};
    
    /* any bubbled property update listeners */
    this.parentAttrUpdateListeners = {};
    
    /* all events tied to the node */
    this.events = {};
    
    /* all bubbled Events */
    this.bubbledEvents = {};
    
    /* Extra logic properties */
    
    /* if the stop update listeners has been called */
    this.stop = undefined;
    
    /* helps bypass resets on array methods */
    this.bypass = undefined;
    
    /* sets true when array is being heavily modified to not fire events until finished, example Sort method */
    this.isModifying = false;
    
    /* start array index for parsing json */
    this.setIndex = 0;
    
    /* allows bypassing length set and updates events */
    this.lengthSet = lengthSet;
  }
  
  /* OBJECT CLASSES */
  /* ENDREGION */
  
  /* EVENT HELPER METHODS */
  /* REGION */
  
  /* Helper method to loop through listeners and run them, node listeners */
  function loopListener(looper,e)
  {
    /* listeners array */
    var _looper = looper,
        _len = _looper.length,
        _e = e,
        _x;
    for(_x=0;_x<_len;_x++)
    {
      /* loop and call listeners */
      if(_looper[_x](_e) === false) _e.__preventDefault__ = true;
      
      /* if stopImmediatePropogation method was called then we stop calling listeners on this node  */
      if(_e.__stopImmediatePropogation__) break;
    }
  }
  
  /* Helper method to loop through all bubbled listeners and run them parent nodes */
  function loopBubbledListener(looper,e)
  { 
    /* bubbled listeners array */
    var _looper = looper,
        _len = _looper.length,
        _e = e,
        _x;
    
    for(_x=0;_x<_len;_x++)
    {
      /* get the parent node for the event */
      _e.target = _looper[_x].parent;
      
      /* call bubbled parent node listeners */
      _looper[_x].func(_e);
      
      /* stop bubbling if stopImmediatePropogation or stopPropogation is called */
      if(_e.__stopPropogation__ !== undefined) break;
    }
  }
  
  function getLayer(obj, key)
  {
    var __scopeArray = (typeof key === 'string' ? key.split('.') : [key]),
        __retObj = obj,
        __len = __scopeArray.length,
        __x = 0;
    
    for(__x;__x<(__len - 1);__x++)
    {
      if(__retObj[__scopeArray[__x]] === 'undefined')
      {
        if(__retObj.set) __retObj.set(__scopeArray[__x], {});
      }
      else if(__retObj[__scopeArray[__x]] !== undefined) 
      {
        if(typeof __retObj[__scopeArray[__x]] === 'object') __retObj = __retObj[__scopeArray[__x]];
      }
    }
    
    return __retObj;
  }
  
  function getKey(key)
  {
    return (typeof key === 'string' ? key.substring(key.lastIndexOf('.') + 1, key.length) : key.toString());
  }
  
  function getLength(obj)
  {
    var keys = __keys(obj, 'array');
    return (parseInt(keys[(keys.length - 1)], 10) + 1);
  }
  
  /* EVENT HELPER METHODS */
  /* ENDREGION */
  
  /* SET/UPDATE METHODS */
  /* REGION */
  
  /* runs the associated pre value set listeners */
  function _setStandard(obj, type, prop, val, oldValue, __extensions, stop, args, action)
  {
    if(__extensions.isModifying) return true;
    /* create event */
    // value,oldValue,target,attr,style,args,action,srcElement,type,stop,cancelable,bubbles
    var e = new changeEvent(val,oldValue,obj,prop,args,action,obj,type,stop);
    
    /* get standard and bubbled listeners */
    var localAttrListeners = __extensions.attrListeners,
        localParentAttrListeners = __extensions.parentAttrListeners,
        all = __all__;

    /* loop local listeners first */
    if(localAttrListeners[prop])
    {
      loopListener(localAttrListeners[prop],e);
    }
    
    if(!e.__stopImmediatePropogation__ && localAttrListeners[type])
    {
      loopListener(localAttrListeners[type],e);
    }
    
    /* if a * (all) listener was added, loop them */
    if(!e.__stopImmediatePropogation__ && localAttrListeners[all])
    {
      loopListener(localAttrListeners[all],e);
    }

    /* loop bubbled listeners */
    if(!e.__stopPropogation__ && localParentAttrListeners[prop])
    {
      loopBubbledListener(localParentAttrListeners[prop],e);
    }

    if(!e.__stopPropogation__ && localParentAttrListeners[type])
    {
      loopBubbledListener(localParentAttrListeners[type],e);
    }
    
    /* if a * (all) bubbled listener was added, loop them */
    if(!e.__stopPropogation__ && localParentAttrListeners[all])
    {
      loopBubbledListener(localParentAttrListeners[all],e);
    }
    
    if(e.__preventDefault__) return false;
    return true;
  }
  
  /* runs the associated post value set update listeners */
  function _updateStandard(obj, type, prop, val, oldValue, __extensions, args, action)
  {
    if(__extensions.isModifying) return true;
    /* create event */
    // value,oldValue,target,attr,style,args,action,srcElement,type,stop,cancelable,bubbles
    var e = new changeEvent(val,oldValue,obj,prop,args,action,obj,type+'update');
    /* get standard and bubbled update listeners */
    var localAttrListeners = __extensions.attrUpdateListeners,
        localParentAttrListeners = __extensions.parentAttrUpdateListeners,
        all = __all__;

    /* loop local listeners first */
    if(localAttrListeners[prop])
    {
      loopListener(localAttrListeners[prop],e);
    }
    
    if(!e.__stopImmediatePropogation__ && localAttrListeners[type])
    {
      loopListener(localAttrListeners[type],e);
    }
    
    /* if a * (all) listener was added, loop them */
    if(!e.__stopImmediatePropogation__ && localAttrListeners[all])
    {
      loopListener(localAttrListeners[all],e);
    }

    /* loop bubbled listeners */
    if(!e.__stopPropogation__ && localParentAttrListeners[prop])
    {
      loopBubbledListener(localParentAttrListeners[prop],e);
    }

    if(!e.__stopPropogation__ && localParentAttrListeners[type])
    {
      loopBubbledListener(localParentAttrListeners[type],e);
    }
    
    /* if a * (all) bubbled listener was added, loop them */
    if(!e.__stopPropogation__ && localParentAttrListeners[all])
    {
      loopBubbledListener(localParentAttrListeners[all],e);
    }
    
    if(e.__preventDefault__) return false;
    return true;
  }
  
  /* SET/UPDATE METHODS */
  /* ENDREGION */
  
  /* COMMON DESCRIPTORS GET/SET, VALUE, FUNCTION, HIDDEN */
  /* REGION */
  
  function descriptorSimple(value)
  {
    return {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true
    }
  }
    
  /* hidden properties */
  function descriptorHidden(value)
  {
    /* creates a descriptor that is not loopable/enumerable */
    return {
      writable:true,
      value:value,
      enumerable:false,
      configurable:true
    }
  }
  
  function descriptorHiddenSetter(value)
  {
    var __value = value;
    
    /* creates a descriptor that is not loopable/enumerable */
    return {
      get:function(){ return __value},
      set:function(v){ __value = v;},
      enumerable:false,
      configurable:true
    }
  }
  
  function descriptorImmutable(value)
  {
    return {
      value: value,
      writable: false,
      enumerable: true,
      configurable: true
    }
  }
  
  function descriptorStandard(key, value, extensions)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __key = key,
        __isIndex = isIndex(key),
        __update = _updateStandard,
        __set = _setStandard,
        __extensions = extensions,
        __value = value,
        __oldValue,
        __debounce = false,
        __state;
    
    function set(v)
    {
      /* fanciness for array methods that mutate the array, need to reiterate for change updates */
      __state = (__oldValue === undefined ? 'create' : (v === undefined ? 'delete' : 'set'));
      
      /* isModifying set pre mutate methods, debounce gets set */
      if(__extensions.isModifying && __debounce)
      {
        __value = v;
        
        if(__state === 'delete')
        {
          Object.defineProperty(this,__key,descriptorHidden(undefined));
          if(__isIndex) __extensions.lengthSet(getLength(this), true);
        }
        return true;
      }

      if(__extensions.isModifying && !__debounce) 
      {
        __oldValue = __value;
        __debounce = true;
        __value = v;
        if(__state === 'delete')
        {
          Object.defineProperty(this,__key,descriptorHidden(undefined));
          if(__isIndex) __extensions.lengthSet(getLength(this), true);
        }
        
        if(__state === 'create' && __isIndex) __extensions.lengthSet(getLength(this), true);
        return true;
      }
      
      /* after isModifying is turned off and a set happens, oldValue will show proper value before mutate for set */
      if(!__debounce) __oldValue = __value;
      
      /* run the pre value set listeners */
      if(__set(this,__state,__key,v,__oldValue,__extensions,__extensions.stop))
      {
        /* if the default was not prevented, set the value */
        __value = v;
        
        /* delete needs to be made hidden */
        if(__state === 'delete')
        {
          Object.defineProperty(this,__key,descriptorHidden(undefined));
          if(__isIndex) __extensions.lengthSet(getLength(this), true);
        }
        else if(__state === 'create' && __isIndex) __extensions.lengthSet(getLength(this), true);
        
        /* if update listeners were not stopped run them */
        if(!__extensions.stop) __update(this,__state,__key,v,__oldValue,__extensions);
      }
      /* if a new value being created is rejected, then reset to hidden undefined */
      else if(__oldValue === undefined)
      {
        Object.defineProperty(this,__key,descriptorHidden(undefined));
        if(__isIndex) __extensions.lengthSet(getLength(this), true);
      }
      /* if a debounce is rejected or a delete property was rejected, reset the value */
      else if(__debounce || v === undefined) __value = __oldValue;
      
      /* reset update stop */
      __extensions.stop = undefined;
      __debounce = false;
    }
    
    return {
      get: function(){ return __value; },
      set:set,
      enumerable: true,
      configurable: true
    }
  }
  
  function descriptorPointer(obj, key)
  {
    var __obj = obj,
        __key = key;
    
    return {
      get: function(){ return (__obj[__key]); },
      set: function(v)
      { 
        (this.stop ? __obj.stop() : __obj)[key] = v;
        this.stop = false;
      },
      enumerable: true,
      configurable: true
    }
  }
  
  function descriptorLength(len)
  {
    var __spliceMethod = __splice,
        __key = 'length',
        __update = _updateStandard,
        __set = _setStandard,
        __extensions,
        __value = len,
        __oldValue = len,
        __currentValue,
        __keys;
    
    function set(v, bypass)
    {
      if(typeof v === 'string') v = parseInt(v, 10);
      if(!__extensions) __extensions = this.__frytkiExtensions__;
      
      __oldValue = __value;
      
      /* bypass allows us to set the length when adding or removing items without effecting the array */
      if(bypass || __extensions.isModifying) return (__value = v);
      
      /* run the pre value set listeners */
      if(__set(this,'set',__key,v,__value,__extensions,__extensions.stop))
      {
        if(v < __value)
        {
          __spliceMethod.call(this,v,(__value - v));
        }
        else if(v > __value)
        {
          __spliceMethod.apply(this,[__value,0].concat(Array.apply(null, Array((v - __value)))))
        }
        
        /* in case values were rejected during splice */
        __keys = this.keys(this,'array');
        __currentValue = (parseInt(__keys[__keys.length], 10) + 1);
        if(__currentValue !== v) v = __currentValue;
        
        /* if the default was not prevented, set the value */
        __value = v;
        
        /* if update listeners were not stopped run them */
        if(!__extensions.stop) __update(this,'set',__key,v,__oldValue,__extensions);
      }
      
      /* reset update stop */
      __extensions.stop = undefined;
    }
    
    function get(){ return __value; }
    
    return {
      set: set,
      get: get,
      enumerable: false,
      configurable: true
    }
  }
  
  /* COMMON DESCRIPTORS GET/SET, VALUE, FUNCTION, HIDDEN */
  /* ENDREGION */
  
  /* TYPE CHECKS */
  /* REGION */
  
  function isObject(v)
  {
    return (__typeof.call(this,v) === 'object');
  }
  
  function isArray(v)
  {
    return (__typeof.call(this,v) === 'array');
  }
  
  function isJSON(str)
  {
    try { JSON.parse(str); }
    catch (e) { return false; }
    return true;
  }
  
  function isIndex(key)
  {
    return (typeof key === 'number' || ((key.length === 1 || key.charAt(0) !== '0') && !isNaN(parseInt(key, 10))));
  }
  
  /* TYPE CHECKS */
  /* ENDREGION */
  
  /* EVENT METHODS */
  /* REGION */
  
  function addEventListener(key, func, hasUpdate, isParent)
  {
    var __object = getLayer(this, key),
        __key = getKey(key).replace('update',''),
        __extensions = __object.__frytkiExtensions__,
        __hasUpdate = ((hasUpdate || (typeof key === 'string' && key.lastIndexOf('update') === (key.length - 6))) ? 'update' : ''),
        __listener = (!__hasUpdate ? (isParent ? 'parentA' : 'a') + 'ttrListeners' : (isParent ? 'parentA' : 'a') + 'ttrUpdateListeners'),
        __keys = Object.keys(__object),
        __len = __keys.length,
        __x = 0,
        __current;
    
    if(!__extensions[__listener][__key]) __extensions[__listener][__key] = [];
    __extensions[__listener][__key].push((isParent ? {func:func,parent:__extensions.immediateParent} : func));
    
    for(__x;__x<__len;__x++)
    {
      __current = __object[__keys[__x]];
      if(typeof __current === 'object') __current.addEventListener(__key, func, __hasUpdate, true);
    }
  }
  
  function removeEventListener(key, func, hasUpdate, isParent)
  {
    var __object = getLayer(this, key),
        __key = getKey(key).replace('update',''),
        __extensions = __object.__frytkiExtensions__,
        __stringFunc = func.toString(),
        __hasUpdate = ((hasUpdate || (typeof key === 'string' && key.lastIndexOf('update') === (key.length - 6))) ? 'update' : ''),
        __listener = (!__hasUpdate ? (isParent ? 'parentA' : 'a') + 'ttrListeners' : (isParent ? 'parentA' : 'a') + 'ttrUpdateListeners'),
        __listeners = __extensions[__listener][__key],
        __keys = Object.keys(__object),
        __len = __listeners.length,
        __lenKeys = __keys.length,
        __x = 0,
        __current;
    
    for(__x;__x<__len;__x++)
    {
      __current = (isParent ? __listeners[__x].func : __listeners[__x]);
      if(__current.toString() === __stringFunc)
      {
        __listeners.splice(__x,1);
        break;
      }
    }
    
    for(__x=0;__x<__lenKeys;__x++)
    {
      __current = __object[__keys[__x]];
      if(typeof __current === 'object') __current.removeEventListener(__key, __stringFunc, __hasUpdate, true);
    }
  }
  
  function stop()
  {
    this.__frytkiExtensions__.stop = true;
    return this;
  }
  
  /* ENDREGION */
  /* EVENT METHODS */
  
  /* OBJECT METHODS */
  /* REGION */
  
  /* Number strings are not converted to numbers */
  function parse(json,func)
  {
    var layer = ((this.__frytkiExtensions__ && this.__frytkiExtensions__.ref) ? this : Frytki()),
    
    /* This makes sure the selection is not inside a "" string as a value */
    /* 
    notInString = '(?=(?:[^"]|"[^"]*")*$)',
    startObject = '\\{'+notInString,
    endObject = '\\}'+notInString,
    startKey1 = '\\{\\"',
    startKey2 = '\\,\\"'+notInString,
    startArr = '\\['+notInString,
    endArr = '\\]'+notInString,
    nextIndex = '\\,'+notInString,
    startValue = '\\"\\:',
    endValue = '\\"\\}',
    regEx = new RegExp('('+startKey1+'|'+startKey2+'|'+startArr+'|'+endArr+'|'+startValue+'|'+endValue+'|'+startObject+'|'+nextIndex+'|'+endObject+')'),
    */
        
        regEx = /({"|,"(?=(?:[^"]|"[^"]*")*$)|\[(?=(?:[^"]|"[^"]*")*$)|\](?=(?:[^"]|"[^"]*")*$)|":|"}|{(?=(?:[^"]|"[^"]*")*$)|,(?=(?:[^"]|"[^"]*")*$)|}(?=(?:[^"]|"[^"]*")*$))/,
        split = json.split(regEx).filter(Boolean),
        UKeys = [],
        scope = '',
        
        extensions = layer.__frytkiExtensions__,
        x = 1,
        len=split.length,
        currKey = '',
        prevKey = '',
        futureKey = '',
        UKey;
    
    function parseValue(val)
    {
      var i = parseFloat(val,10),
          b = (val === 'true'),
          l1 = val.indexOf('"'),
          l2 = val.lastIndexOf('"');
      if(!isNaN(i) && i.toString().length === val.length)
      {
        return i;
      }
      else if(b || val === 'false')
      {
        return b;
      }
      else
      {
        if(l1 === 0 && l2 !== 0)
        {
          val = val.substring(1,(val.length-1));
        }
        else
        {
          val = val.substring(1,val.length);
        }
      }
      return val;
    }
    
    /* looking for: {" or ": ," }*/
    for(x;x<len;x++)
    {
      currKey = split[x];
      prevKey = split[(x-1)];
      futureKey = split[(x+1)];
      UKey = UKeys[(UKeys.length-1)];

      /* we have a new object */
      if((prevKey === '":' && currKey === '{"') || (prevKey === '":' && currKey === '['))
      {
        scope += (!scope.length ? '' : '.') + UKey;
        if(!layer.get(UKey)) layer.set(UKey,(func ? func(UKey,{},scope,layer) : {}));
        layer = layer.get(UKey);
        extensions = layer.__frytkiExtensions__;
        UKeys.pop();
      }

      /* we have an array index */
      else if(prevKey === '[' || (prevKey === ',' && layer.length !== 0))
      {
        if(currKey === '{' || currKey === '{"')
        {
          scope += (scope.length !== 0 ? '.' : '') + extensions.setIndex;
          if(typeof layer.get(extensions.setIndex) !== 'object') layer.set(extensions.setIndex,(func ? func(layer.length,{},scope,layer) : {}));
          extensions.setIndex += 1;
          layer = layer.get(extensions.setIndex-1);
          extensions = layer.__frytkiExtensions__;
        }
        else
        {
          layer.set(extensions.setIndex,(func ? func(layer.length,parseValue(currKey),scope,layer) : parseValue(currKey)));
          extensions.setIndex += 1;
        }
      }

      /* we have a value */
      else if(prevKey === '":')
      {
        layer.set(UKey,(func ? func(UKey,parseValue(currKey),scope,layer) : parseValue(currKey)));
        UKeys.pop();
      }

      /* we have a key */
      else if(prevKey === '{"' || (prevKey === ',' && futureKey === '":'))
      {
        UKeys[UKeys.length] = currKey.replace(/\"/g,'');
      }

      /* we go out of current object */
      else if((prevKey === '}' || prevKey === ']') && currKey !== undefined)
      {
        scope = (scope.indexOf('.') !== -1 ? scope.substring(0,(scope.lastIndexOf('.')-1)) : '');
        layer = extensions.immediateParent;
        extensions = layer.__frytkiExtensions__;
      }
    }
    return this;
  }
  
  function get(key)
  {
    return getLayer(this,key)[getKey(key)];
  }
  
  function create(key, val)
  {
    this.set(key, val, true);
    return this;
  }
  
  function add(key, val)
  {
    this.set(key, val, true);
    return this;
  }
  
  function set(key, val, create)
  {
    var __layer = getLayer(this, key),
        __key = getKey(key),
        __extensions = __layer.__frytkiExtensions__;
    
    if(val && typeof val === 'object' && __typeof(val) !== 'Frytki')
    {
      val = Frytki(val, __extensions.base, __extensions.scope + (!__extensions.scope.length ? '' : '.') + __key, __layer, __extensions.hash);
    }
    
    if(!__layer[key] || create)
    {
      Object.defineProperty(__layer,__key,descriptorStandard(__key, undefined, __extensions));
    }
    
    __layer[__key] = val;
    return this;
  }
  
  /* needs reworked to fit set standard descriptor */
  function setPointer(key, fromKey, parent)
  {
    var __layer = getLayer(this, key),
        __key = getKey(key),
        __extensions = __layer.__frytkiExtensions__;
    
    /* fire create event */
    if(_setStandard(__layer,(!__layer[__key] ? 'create' : 'set'),__key, (fromKey ? parent[fromKey] : parent),'undefined',__extensions, __extensions.stop))
    {
      Object.defineProperty(__layer,__key, (fromKey ? descriptorPointer(fromKey, parent) : descriptorStandard(__key, parent, __extensions)));
      
      if(isIndex(__key))
      {
        var keys =  __keys(__layer,'array');
        __extensions.lengthSet.call(__layer, (parseInt(keys[(keys.length - 1)], 10) + 1), true);
      }
         
      if(!__extensions.stop) _updateStandard(__layer, (!__layer[__key] ? 'create' : 'set'), __key, 'undefined', __extensions);
      __extensions.pointers[__key] = {key:fromKey,parent:parent};
    }
    
    return this;
  }
  
  function remove(key)
  {
    return this.del(key);
  }
  
  function del(key)
  {
    var __layer = getLayer(this, key),
        __key = getKey(key);
    
    __layer[__key] = undefined;
    return this;
  }
  
  function move(obj, key)
  {
    var __layer = getLayer(obj, key),
        __key = getKey(key);
        
    this.set(key, __layer[__key]);
    
    if(obj.del) obj.del(key);
    __layer[__key] = undefined;
    return this;
  }
  
  function copy(obj, key)
  {
    var __layer = getLayer(obj, key),
        __key = getKey(key);
    
    this.set(key, __layer[__key]);
    return this;
  }
  
  function merge(obj)
  {
    var __objectTypes = __ObjectTypes__,
        __keys,
        __len,
        __x,
        __cacheFrom = [],
        __cacheTo = [],
        __cacheIndex;
    
    /* on cache we track the `to` objects to use for circular refrences */
    
    function recMerge(from, to)
    {
      var __key;
      
      __keys = Object.keys(from);
      __len = __keys.length;
      __x = 0;
      
      for(__x;__x<__len;__x++)
      {
        __key = __keys[__x];
        if(__objectTypes.indexOf(__typeof(from[__key])) !== -1)
        {
          __cacheIndex = __cacheFrom.indexOf(from[__key])
          
          if(__cacheIndex === undefined && !to[__key])
          {
            to.set(__key,{});
            __cacheFrom.push(from[__key]);
            __cacheTo.push(to[__key]);
            recMerge(from[__key],to[__key]);
          }
          else if(__cacheIndex !== undefined)
          {
            to.set(__key,__cacheTo[__cacheIndex]);
          }
        }
        else
        {
          to.set(__key,from[__key]);
        }
      }
    }
    
    recMerge(obj, this);
    /* clear for GC */
    __cacheFrom = [];
    __cacheTo = [];
    return this; 
  }

  function valueOf()
  {
    var obj = {},
        keys = __keys(this),
        keyLength= keys.length,
        x = 0;
    
    for(x;x<keyLength;x++)
    {
      obj[keys[x]] = this[keys[x]];
    }
    
    return obj;
  }
  
  /* stringify object, remove circular references */
  function toJSON()
  {
    var __objectTypes = __ObjectTypes__,
        __stringObj = {},
        __cache = [],
        __cacheName = [],
        __cacheIndex = 0,
        __keys,
        __len,
        __x;
    
    function recJSON(from, to)
    {
      var __key;
      
      __keys = Object.keys(from);
      __len = __keys.length;
      __x = 0;
      
      for(__x;__x<__len;__x++)
      {
        __key = __keys[__x];
        if(__objectTypes.indexOf(__typeof(from[__key])) !== -1)
        {
          __cacheIndex = __cache.indexOf(from[__key]);
          if(__cacheIndex === -1)
          {
            __cache.push(from[__key])
            __cacheName.push(__key)
            to[__key] = recJSON(from[__key],{});
          }
          else
          {
            to[__key] = '[Circular ' + __cacheName[__cacheIndex] + ' Object]'
          }
        }
        else
        {
          to[__key] = from[__key];
        }
      }
      
      return to;
    }
    
    return recJSON(this, __stringObj);
  }
  
  /* OBJECT METHODS */
  /* ENDREGION */
  
  /* ARRAY METHODS */
  /* REGION */
  
  /* sort is ok to do a reset, all items will have changed */
  function sort(func)
  {
    var __extensions = this.__frytkiExtensions__,
        __return;
    
    __extensions.isModifying = true;
    __return = __sort.call(this,func);
    __extensions.isModifying = false;
    
    if(typeof __extensions.bypass !== 'function' || __extensions.bypass())
    {
      var __i = 0,
          __len = this.length;
    
      for(__i;__i<__len;__i++)
      {
        this[__i] = this[__i];
      }
    }
    return __return;
  }
  
  /* splice allows creating new elements, must be custom */
  function splice(index,remove)
  {
    var __extensions = this.__frytkiExtensions__,
        __inserts = __slice.apply(arguments).slice(2),
        __insertLen = __inserts.length,
        __index = 0,
        __x = 0,
        __i = 0,
        __len,
        __return = [],
        __del = [],
        __delIndex;
    
    __extensions.isModifying = true;
    if(remove !== 0)
    {
      if(this[((index-1)+remove)] !== undefined)
      {
        for(__x;__x<remove;__x++)
        {
          __return.push(this[index]);
          __i = index
          __len = (this.length - 1);
          for(__i;__i<__len;__i++)
          {
              this[__i] = this[(__i + 1)];
          }
          __del.push((this.length - (__x + 1)))
        }
      }
    }
    if(__insertLen !== 0)
    {
      __x = 0;
      for(__x;__x<__insertLen;__x++)
      {
        __index = (index + __x);
        __i = (this.length - (__del.length));
        for(__i;__i>__index;__i--)
        {
          if(__del.indexOf(__i) !== -1) __del.splice(__del.indexOf(__i), 1);
          this.set(__i, this[(__i - 1)]);
        }
        this.set(__index, __inserts[__x]);
      }
    }
    
    if(__del.length)
    {
      __x = 0;
      __len = __del.length;
      for(__x;__x<__len;__x++)
      {
        this.del(__del[__x]);
      }
    }
    
    __extensions.isModifying = false;
    
    __x = index;
    __len = ((__insertLen && __insertLen === remove) ? (index + __insertLen) : this.length)
    if(typeof __extensions.bypass !== 'function' || __extensions.bypass(__x,__len))
    {
      for(__x;__x<__len;__x++)
      {
        this[__x] = this[__x];
      }
    }
    return __return;
  }
  
  function shift()
  {
    var __extensions = this.__frytkiExtensions__,
        __lenAr = this.length,
        __x = 0,
        __return = this[0];
    
    __extensions.isModifying = true;
    for(__x;__x<__lenAr;__x++)
    {
      this[__x] = this[(__x + 1)]
    }
    __extensions.isModifying = false;
    if(typeof __extensions.bypass !== 'function' || __extensions.bypass())
    {
      var __i = 0,
          __len = (this.length + 1);
    
      for(__i;__i<__len;__i++)
      {
        this[(this[__i] !== undefined ? 'set' : 'del')](__i,this[__i]);
      }
    }
    return __return;
  }
  
  function unshift()
  {
    var __extensions = this.__frytkiExtensions__,
        __inserts = __slice.call(arguments),
        __lenInserts = __inserts.length,
        __x = ((this.length - 1) + __lenInserts),
        __set = [];
    
    __extensions.isModifying = true;
    for(__x;__x!==-1;__x--)
    {
      if(__x < __lenInserts)
      {
        this.set(__x, __inserts[__x]);
      }
      else
      {
        if(this[__x] !== undefined) __set.push(__x);
        this.set(__x,this[(__x - __inserts.length)]);
      }
    }
    __extensions.isModifying = false;
    
    if(typeof __extensions.bypass !== 'function' || __extensions.bypass())
    {
      var __i = 0,
          __len = this.length;
    
      for(__i;__i<__len;__i++)
      {
        if(__set.indexOf(__i) !== -1)
        {
          this[__i] = this[__i];
        }
        else 
        {
          this.set(__i, this[__i], true);
        }
      }
    }
    return this.length;
  }
  
  function push(v)
  {
    var __extensions = this.__frytkiExtensions__;
    
    __extensions.isModifying = true;
    this.set(this.length,v);
    __extensions.isModifying = false;
    if(typeof __extensions.bypass !== 'function' || __extensions.bypass((this.length - 1), this.length))
    {
      this.set((this.length - 1), this[(this.length - 1)], true);
    }
    return this.length;
  }
  
  function pop()
  {
    var __extensions = this.__frytkiExtensions__,
        __return;
    
    __extensions.isModifying = true;
    __return = __pop.call(this);
    __extensions.isModifying = false;
    if(typeof __extensions.bypass !== 'function' || __extensions.bypass(this.length, (this.length + 1)))
    {
      this.del(this.length);
    }
    return __return;
  }
  
  function reverse()
  {
    var __extensions = this.__frytkiExtensions__,
        __return;
    
    __extensions.isModifying = true;
    __return = __reverse.call(this);
    __extensions.isModifying = false;
    if(typeof __extensions.bypass !== 'function' || __extensions.bypass())
    {
      var __i = 0,
          __len = this.length;
    
      for(__i;__i<__len;__i++)
      {
        this[__i] = this[__i];
      }
    }
    return __return;
  }
  
  function fill(val, from, to)
  {
    from = (from !== undefined ? Math.max(0,from) : 0);
    to = ((to !== undefined && to <= this.length) ? Math.min(this.length,Math.max(0,to)) : this.length);
    
    var __extensions = this.__frytkiExtensions__,
        __x = from,
        __set = [];
    
    __extensions.isModifying = true;
    for(__x;__x<to;__x++)
    {
      if(this[__x] !== undefined) __set.push(__x);
      this.set(__x, val);
    }
    __extensions.isModifying = false;
    if(typeof __extensions.bypass !== 'function' || __extensions.bypass(from, to))
    {
      var __i = from,
          __len = to;
    
      for(__i;__i<__len;__i++)
      {
        if(__set.indexOf(__i) !== -1)
        {
          this[__i] = this[__i]
        }
        else
        {
          this.set(__i, this[__i], true);
        }
      }
    }
    return this;
  }
  
  function copyWithin(target, from, to)
  {
    from = (from || 0);
    to = (to || 0);
    
    var __extensions = this.__frytkiExtensions__,
        __x,
        __return;
    
    __extensions.isModifying = true;
    if(target < this.length)
    {
      target = (target < 0 ? (this.length-1) : target);
      from = (from < this.length ? from : (this.length-1));
      to = (to < this.length ? to : (this.length-1));
      from = (from < 0 ? (this.length-1) : from);
      to = (from < 0 ? (this.length-1) : to);
      __x = from;
      for(__x;__x<=to;__x++)
      {
        this[(target + (__x - from))] = this[__x];
      }
    }
    __extensions.isModifying = false;
    if(typeof __extensions.bypass !== 'function' || __extensions.bypass(target, (target + (!to ? 1 : to - from))))
    {
      var __i = target,
          __len = (target + (!to ? 1 : to - from));
      
      for(__i;__i<__len;__i++)
      {
        this[__i] = this[__i];
      }
    }
    return __return;
  }
  
  /* ARRAY METHODS */
  /* ENDREGION */
  
  /* used as a class, `new frytki({})` */
  function Frytki(obj, base, scope, parent, hash)
  { 
    var __obj = (obj || {}),
        __hash = (hash || (Math.random() * Date.now()).toFixed(0)),
        /* this allows us to overwrite the length property on an array while otherwise it's non configurable */
        __ref = {},
        __childKeys = __keys(__obj),
        __base = (base || __ref),
        __parent = (parent || __base),
        __scope = (scope || ''),
        __x = 0,
        __len = __childKeys.length,
        __key = '',
        __lengthDescriptor = descriptorLength(0),
        __lengthSet = __lengthDescriptor.set;
    
    Object.defineProperties(__ref, {
      __frytkiExtensions__: descriptorHiddenSetter(new localBinders(__hash, __ref, __base, __scope, __parent, __lengthSet)),
      length: __lengthDescriptor
    });
    __ref.__proto__ = Frytki.prototype;
    
    /* if nothing is passed it is an empty object */
    if(__obj && typeof __obj === 'object')
    {
      /* loop add descriptors */
      for(__x;__x<__len;__x++)
      {
        __key = __childKeys[__x];
        if(isIndex(__key)) __lengthSet.call(__ref, (__ref.length + 1), true); // need to bypass length descriptor for direct support/faster
        if(typeof obj[__key] === 'object')
        {
          Object.defineProperty(__ref, __key,descriptorStandard(__key, Frytki(obj[__key], __base, (__scope + (!__scope.length ? '' : '.') + __key), __ref, __hash), __ref.__frytkiExtensions__));
        }
        else
        {
          Object.defineProperty(__ref, __key,descriptorStandard(__key, __obj[__key], __ref.__frytkiExtensions__));
        }
      }
    }
    else if(typeof __obj === 'string' && isJSON(__obj))
    {
      __ref = __ref.parse(__obj);
    }
    
    return __ref;
  }
  
  Object.defineProperties(Frytki.prototype, {
    
    /* Methods */
    stop:descriptorHidden(stop),
    typeof:descriptorHidden(__typeof),
    keys:descriptorHidden(__keys),
    isObject:descriptorHidden(isObject),
    isArray:descriptorHidden(isArray),
    isJSON:descriptorHidden(isJSON),
    toString:descriptorHidden(__toString),
    addEventListener:descriptorHidden(addEventListener),
    removeEventListener:descriptorHidden(removeEventListener),
    valueOf:descriptorHidden(valueOf),
    toJSON:descriptorHidden(toJSON),
    
    /* Object */
    parse:descriptorHidden(parse),
    get:descriptorHidden(get),
    set:descriptorHidden(set),
    setPointer:descriptorHidden(setPointer),
    del:descriptorHidden(del),
    remove:descriptorHidden(remove),
    create:descriptorHidden(create),
    add:descriptorHidden(add),
    move:descriptorHidden(move),
    copy:descriptorHidden(copy),
    merge:descriptorHidden(merge),
    
    /* ARRAY */
    
    /* Non destructive Array methods */
    concat:descriptorHidden(Array.prototype.concat),
    includes:descriptorHidden(Array.prototype.includes),
    indexOf:descriptorHidden(Array.prototype.indexOf),
    join:descriptorHidden(Array.prototype.join),
    lastIndexOf:descriptorHidden(Array.prototype.lastIndexOf),
    slice:descriptorHidden(Array.prototype.slice),
    
    entries:descriptorHidden(Array.prototype.entries),
    every:descriptorHidden(Array.prototype.every),
    filter:descriptorHidden(Array.prototype.filter),
    find:descriptorHidden(Array.prototype.find),
    
    findIndex:descriptorHidden(Array.prototype.findIndex),
    forEach:descriptorHidden(Array.prototype.forEach),
    map:descriptorHidden(Array.prototype.map),
    reduce:descriptorHidden(Array.prototype.reduce),
    reduceRight:descriptorHidden(Array.prototype.reduceRight),
    some:descriptorHidden(Array.prototype.some),
    values:descriptorHidden(Array.prototype.values),
    
    
    /* Destructive Array methods */
    sort:descriptorHidden(sort),
    splice:descriptorHidden(splice),
    shift:descriptorHidden(shift),
    unshift:descriptorHidden(unshift),
    push:descriptorHidden(push),
    pop:descriptorHidden(pop),
    reverse:descriptorHidden(reverse),
    fill:descriptorHidden(fill),
    copyWithin:descriptorHidden(copyWithin)
  })
  
  /* AMD AND COMMONJS COMPATABILITY */
  /* REGION */
  
  if (typeof define === "function" && define.amd){
    define('frytki',function(){return Frytki;});
  }
  if(typeof module === 'object' && typeof module.exports === 'object'){
    module.exports.frytki = Frytki;
  }
  
  /* ENDREGION */
  
  return Frytki;
}())