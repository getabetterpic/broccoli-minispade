var Filter = require('broccoli-filter');
var path = require('path');

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
  var contents = '', this_dir = path.dirname(name);
  if (this.rewriteRequire) {
    contents = contents.replace(/\s*(require|requireAll)\s*\(\s*[\'\"]([^\'\"]*)[\'\"]\s*\)\s*/g, function(match, p1, p2) {
      path = p2[0] === '.' ? p2.slice(1) : p2;
      path = this_dir + path;
      return "minispade." + p1 + "('" + path + "')";
    });
  }
  var moduleId = name.replace(/(lib\/|\/index)/, '').replace('.js', '');
  if (this.useSourceUrl === true) {
    contents = JSON.stringify("(function() {" + code + "})();//# sourceURL=" + moduleId);
  } else {
    contents = "function() {" + code + "}";
  }
  return "minispade.register('" + moduleId + "'," + contents + ");";
}
