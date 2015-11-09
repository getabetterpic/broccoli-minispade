var testHelpers = require('broccoli-test-helpers');
var assert = require('assert');
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
  });
});