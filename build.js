const { unlink, readFileSync, writeFileSync } = require('fs')
      base = process.cwd().replace(/\\/g,'/'),
      closureCompiler = require('google-closure-compiler-js'),
      flags = {};

console.log("Building Frytki Library...");

flags.jsCode = [{src: readFileSync(base+'/frytki.js','utf8')}];
flags.compilationLevel = 'SIMPLE';
flags.rewritePolyfills = false;
unlink(base+'/frytki.min.js', (err) => {
 if(err && !err.code === 'ENOENT') return;
 writeFileSync(base+'/frytki.min.js',closureCompiler(flags).compiledCode);
 console.log("Finished Building Minified Frytki Library..");
});
