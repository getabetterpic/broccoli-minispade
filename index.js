var Filter = require('broccoli-filter');

module.exports = MinispadeFilter;

MinispadeFilter.prototype = Object.create(Filter.prototype);
MinispadeFilter.prototype.constructor = MinispadeFilter;

function MinispadeFilter(inputTree, options) {
  if (!(this instanceof MinispadeFilter)) {
    return new MinispadeFilter(inputTree, options);
  }
  options = options || {};
  this.inputTree = inputTree;
  this.extensions = [ 'js' ];
  this.useSourceUrl = options.useSourceUrl || false;
  this.rewriteRequire = options.rewriteRequire || false;
}

MinispadeFilter.prototype.targetExtension = 'js';

MinispadeFilter.prototype.processString = function(code, name) {
  var contents = '', self = this;
  var moduleId = name.replace(/(\/index|\/javascript[s]*)/, '').replace('.js', '');
  if (this.useSourceUrl === true) {
    contents = JSON.stringify("(function() {" + code + "})();//# sourceURL=" + moduleId);
  } else {
    contents = "function() {" + code + "}";
  }
  if (this.rewriteRequire) {
    contents = contents.replace(/\s*(require|requireAll)\s*\(\s*(\\*\'|\\*\")([^\'\"]*)(\\*\'|\\*\")\s*\)\s*/g, function(match, p1, p2, p3, p4) {
      path = self._getFullPath(name, p3);
      path = path.replace(/\/javascript[s]*/, '');
      return "minispade." + p1 + "(" + p2 + path + p4 + ")";
    });
  }
  return "minispade.register('" + moduleId + "'," + contents + ");";
}

MinispadeFilter.prototype._getFullPath = function(base, relative) {
  if (relative.match(/[\.]{1,2}\//) === null) {
    return relative;
  }
  // This is from a SO answer: http://stackoverflow.com/a/14780463
  var stack = base.split("/"),
    parts = relative.split("/");
  stack.pop(); // remove current file name (or empty string)
               // (omit if "base" is the current folder without trailing slash)
  for (var i=0; i<parts.length; i++) {
    if (parts[i] === ".")
      continue;
    if (parts[i] === "..")
      stack.pop();
    else
      stack.push(parts[i]);
  }
  return stack.join("/");
}
