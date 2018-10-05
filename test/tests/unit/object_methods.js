var standardProperties = (function(){
  return function(describe,it,expect,spy,timer)
  {
    var methods = [];
    
    function runCategory(method)
    {
      var __arguments = Arra.prototype.slice.call(arguments).splice(0,1);
      
      describe(method+':', function(){
        // trackTestTime.call(this,key);
        
        for(var x=0,len=methods.length,perf,el;x<len;x++)
        {
          methods[x](method,arguments);
        }
      });
    }
    
    function getLayer(obj, key)
    {
      var __scopeArray = key.split('.'),
          __retObj = obj,
          __len = __scopeArray.length,
          __x = 0;

      for(__x;__x<(__len - 1);__x++)
      {
        if(typeof __retObj[__scopeArray[__x]] === 'object') __retObj = __retObj[__scopeArray[__x]];
      }

      return __retObj;
    }
    
    function returnsCorrectValue(method, arguments)
    {
      
    }
    
    function setsCorrectData(method, arguments)
    {
       
    }
    
    function firesEvents(method, arguments)
    {
      
    }
    
    function bypassBlocksEvents(method, arguments)
    {
      
    }
    
    describe("Object Method 1:",function(){

    });
  }
}());