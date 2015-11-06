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
    contents.replace('require(', 'minispade.require(');
    contents.replace('requireAll(', 'minispade.requireAll(');
  }
  return "minispade.register('" + moduleId + "'," + contents + ");";
}
