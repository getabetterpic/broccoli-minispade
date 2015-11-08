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
  var contents = '', self = this;
  var moduleId = name.replace(/(lib\/|\/index)/, '').replace('.js', '');
  if (this.useSourceUrl === true) {
    contents = JSON.stringify("(function() {" + code + "})();//# sourceURL=" + moduleId);
  } else {
    contents = "function() {" + code + "}";
  }
  if (this.rewriteRequire) {
    contents = contents.replace(/\s*(require|requireAll)\s*\(\s*[\'\"]([^\'\"]*)[\'\"]\s*\)\s*/g, function(match, p1, p2) {
      if (p2.match(/\//) != null) {
        path = self.getFullPath(name, p2);
      } else {
        path = p2;
      }
      return "minispade." + p1 + "('" + path + "')";
    });
  }
  return "minispade.register('" + moduleId + "'," + contents + ");";
}

MinispadeFilter.prototype.getFullPath = function(base, relative) {
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
