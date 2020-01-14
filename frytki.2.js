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
  __all__ = '*',
      
  __isJSON__ = /(\{.*\:.*)|(\{\})|(\[.*,.*)|(\[\])/;
  
  /* SCOPED LOCALS */
  /* ENDREGION */

  /* DESCRIPTOR LOCALS */
  /* REGION */
  
  var __slice = Array.prototype.slice,
      __sort = Array.prototype.sort,
      __splice = Array.prototype.splice,
      __reverse = Array.prototype.reverse,
      __copyWithin = Array.prototype.copyWithin,
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
          var __obj = (((typeof obj === 'object' && obj) ? obj : this) || {})
          return __getKeys(__obj)
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
    
    /* the name of the property */
    this.key = attr;
    
    /* passed arguments if the property was a method */
    this.arguments = args;
    
    /* the returned result of running that method (update only) */
    this.action = action;
    
    /* the original object that fired the event */
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
    
    /* helps translate between parent and child pointer keys */
    this.parentTranslatePointers = {};
    
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
    
    /* locale of all descriptors */
    this.descriptors = {};
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
      
      /* Reset length in case any listeners are removed from the list */
      if(_len !== _looper.length)
      {
        _x = Math.max(_x - (_len - _looper.length), -1);
        _len = _looper.length;
      }
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
      
      /* Reset length in case any listeners are removed from the list */
      if(_len !== _looper.length)
      {
        _x = Math.max(_x - (_len - _looper.length), -1);
        _len = _looper.length;
      }
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


}());
