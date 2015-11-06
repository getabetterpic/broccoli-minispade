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
  this.useSourceUrl = options.useSourceUrl || false;
  this.rewriteRequire = options.rewriteRequire || false;
}

MinispadeFilter.prototype.targetExtension = 'js';

MinispadeFilter.prototype.processString = function(code, name) {
  var contents = '';
  var moduleId = name.replace(/(lib\/|\/index)/, '').replace('.js', '');
  if (this.useSourceUrl === true) {
    contents = JSON.stringify("(function() {" + code + "})();//# sourceURL=" + moduleId);
  } else {
    contents = "function() {" + code + "}";
  }
  if (this.rewriteRequire) {
    contents = contents.replace(/^\s*require\s*\(\s*/g, 'minispade.require(');
    contents = contents.replace(/^\s*requireAll\s*\(\s*/g, 'minispade.requireAll(');
  }
  return "minispade.register('" + moduleId + "'," + contents + ");";
}
