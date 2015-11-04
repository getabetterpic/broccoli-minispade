var Filter = require('broccoli-filter');

module.exports = MinispadeFilter;

MinispadeFilter.prototype = Object.create(Filter.prototype);
MinispadeFilter.prototype.constructor = MinispadeFilter;

function MinispadeFilter(inputTree, options) {
  if (!(this instanceof MinispadeFilter)) {
    return new MinispadeFilter(inputTree, options);
  }
  this.inputTree = inputTree;
  this.extensions = [ 'js' ];
  this.useSourceUrl = options.useSourceUrl;
  this.rewriteRequire = options.rewriteRequire;
}

MinispadeFilter.prototype.targetExtension = 'js';

MinispadeFilter.prototype.processString = function(code, name) {
  var contents = '';
  if (this.rewriteRequire) {
    code.replace(/require\s*\(\s*/, 'minispade.require(');
    code.replace(/requireAll\s*\(\s*/, 'minispade.requireAll(');
  }
  var moduleId = name.replace('lib/', '').replace('.js', '');
  if (this.useSourceUrl === true) {
    contents = JSON.stringify("(function() {" + code + "})();//# sourceURL=" + moduleId);
  } else {
    contents = "function() {" + code + "}";
  }
  return "minispade.register('" + moduleId + "'," + contents + ");";
}
