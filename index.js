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
    contents = contents
      .replace(/\s*(require|requireAll)\s*\(\s*(\\?\'|\\?\")([^\'\"]*)(\\?\'|\\?\")\s*\)/g,
                function(match, requireStatement, frontQuote, relativePath, backQuote) {
                  path = self._getFullPath(name, relativePath);
                  path = path.replace(/\/javascript[s]*/, '');
                  return "minispade." + requireStatement + "(" + frontQuote + path + backQuote + ")";
                }
      );
  }
  return "minispade.register('" + moduleId + "'," + contents + ");";
}

MinispadeFilter.prototype._getFullPath = function(base, relative) {
  if (relative.match(/[\.]{1,2}\//) === null) {
    return relative;
  }
  var stack = this._getFilenameParts(base),
    parts = this._getFilenameParts(relative);

  // omit _removeCurrentFilename if "base" is the current folder without trailing slash
  stack = this._removeCurrentFilename(stack);

  stack = this._calcFullPath(stack, parts);
  return stack.join("/");
}

MinispadeFilter.prototype._getFilenameParts = function(base) {
  return base.split("/");
}

MinispadeFilter.prototype._removeCurrentFilename = function(stack) {
  stack.pop();
  return stack;
}

MinispadeFilter.prototype._calcFullPath = function(stack, parts) {
  // This is from a SO answer: http://stackoverflow.com/a/14780463
  for (var i=0; i<parts.length; i++) {
    if (parts[i] === ".")
      continue;
    if (parts[i] === "..")
      stack.pop();
    else
      stack.push(parts[i]);
  }
  return stack;
}
