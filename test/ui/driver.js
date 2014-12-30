'use strict';

var selectors = require('./selectors.json');
var lookup = require('./util/lookup');

function Driver(options) {
  this._cmd = options.command;
  this._root = options.root;
}

module.exports = Driver;

Driver.prototype.read = function(region) {
  var selector = lookup(region, selectors);
  return this._cmd.findAllByCssSelector(selector)
    .getVisibleText();
};

Driver.prototype.get = function(path) {
  return this._cmd.get(this._root + path);
};
