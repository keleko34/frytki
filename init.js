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
  
  function init(obj)
  {
    
    return init;
  }
  
  /* AMD AND COMMONJS COMPATABILITY */
  /* REGION */
  
  if (typeof define === "function" && define.amd){
    define('frytki',function(){return init;});
  }
  if(typeof module === 'object' && typeof module.exports === 'object'){
    module.exports.frytki = init;
  }
  
  /* ENDREGION */
  
  return init;
}())