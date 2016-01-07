var testHelpers = require('broccoli-test-helpers');
var _MinispadeFilter = require('../index');
var makeTestHelper = testHelpers.makeTestHelper;
var cleanupBuilders = testHelpers.cleanupBuilders;
var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;

var fixtures = path.join(process.cwd(), 'test/fixtures');


describe('MinispadeFilter', function() {
  var MinispadeFilter = makeTestHelper({
    subject: _MinispadeFilter,
    fixturePath: fixtures
  });

  afterEach(function() {
    return cleanupBuilders();
  });

  describe('#processString', function() {
    it('registers the minispade module', function() {
      var tree = new MinispadeFilter('.');
      return tree.then(function(result) {
        var main = result.files[result.files.indexOf('main.js')];
        var fileContents = fs.readFileSync(path.join(result.directory, main), 'utf8');
        expect(fileContents).to.equal("minispade.register('main',function() {require('hill');});");
      });
    });

    it('rewrites the requires', function() {
      var tree = new MinispadeFilter('.', { rewriteRequire: true });
      return tree.then(function(result) {
        var main = result.files[result.files.indexOf('main.js')];
        var fileContents = fs.readFileSync(path.join(result.directory, main), 'utf8');
        expect(fileContents).to.equal("minispade.register('main',function() {minispade.require('hill');});");
      });
    });

    it('rewrites the requires even after uglification', function() {
      var tree = new MinispadeFilter('no-space', { rewriteRequire: true });
      return tree.then(function(result) {
        var uglified = result.files[result.files.indexOf('uglified.js')];
        var fileContents = fs.readFileSync(path.join(result.directory, uglified), 'utf8');
        expect(fileContents.trim()).to.equal("minispade.register('uglified',function() {minispade.require(\\\"bar_chart\\\");minispade.require(\\\"selectable_bar_chart\\\");\n});".trim());
      });
    });

    it('names the modules based on relative paths', function() {
      var tree = new MinispadeFilter('.', { rewriteRequire: true });
      return tree.then(function(result) {
        var main = result.files[result.files.indexOf('deep/index.js')];
        var fileContents = fs.readFileSync(path.join(result.directory, main), 'utf8');
        expect(fileContents).to.equal("minispade.register('deep',function() {minispade.require('deep/link/stuff');});");
      });
    });

    it('rewrites the required module based on relative paths', function() {
      var tree = new MinispadeFilter('.', { rewriteRequire: true });
      return tree.then(function(result) {
        var main = result.files[result.files.indexOf('deep/link/stuff.js')];
        var fileContents = fs.readFileSync(path.join(result.directory, main), 'utf8');
        expect(fileContents).to.equal("minispade.register('deep/link/stuff',function() {minispade.require('deep/otherStuff');});");
      });
    });

    it('adds the sourceMap if useSourceUrl is true', function() {
      var tree = new MinispadeFilter('.', { rewriteRequire: true, useSourceUrl: true });
      return tree.then(function(result) {
        var main = result.files[result.files.indexOf('main.js')];
        var fileContents = fs.readFileSync(path.join(result.directory, main), 'utf8');
        expect(fileContents).to.equal("minispade.register('main',\"(function() {minispade.require('hill');})();//# sourceURL=main\");");
      });
    });

    it('removes javascript from path', function() {
      var tree = new MinispadeFilter('.', { rewriteRequire: true, useSourceUrl: true });
      return tree.then(function(result) {
        var main = result.files[result.files.indexOf('deep/javascript/file.js')];
        var fileContents = fs.readFileSync(path.join(result.directory, main), 'utf8');
        expect(fileContents).to.equal("minispade.register('deep/file',\"(function() {minispade.require('deep/stuff');})();//# sourceURL=deep/file\");");
      });
    });

    it('removes javascripts from path', function() {
      var tree = new MinispadeFilter('.', { rewriteRequire: true, useSourceUrl: true });
      return tree.then(function(result) {
        var main = result.files[result.files.indexOf('deep/javascripts/files.js')];
        var fileContents = fs.readFileSync(path.join(result.directory, main), 'utf8');
        expect(fileContents).to.equal("minispade.register('deep/files',\"(function() {minispade.require('deep/stuffs');})();//# sourceURL=deep/files\");");
      });
    });

    it('does not namespace a bare multi-directory require', function() {
      var tree = new MinispadeFilter('.', { rewriteRequire: true, useSourceUrl: true });
      return tree.then(function(result) {
        var main = result.files[result.files.indexOf('deep/bootstrap-require.js')];
        var fileContents = fs.readFileSync(path.join(result.directory, main), 'utf8');
        expect(fileContents).to.equal("minispade.register('deep/bootstrap-require',\"(function() {minispade.require('bootstrap-sass/bootstrap-transition');})();//# sourceURL=deep/bootstrap-require\");");
      });
    });
  });
});
