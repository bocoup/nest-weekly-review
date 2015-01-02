'use strict';

var selectors = require('./selectors.json');
var lookup = require('./util/lookup');

function Driver(options) {
  this._cmd = options.command;
  this._root = options.root;
}

module.exports = Driver;

Driver.prototype._$ = function(region) {
  var selector = lookup(region, selectors);
  return this._cmd.findAllByCssSelector(selector);
};

Driver.prototype.read = function(region) {
  return this._$(region).getVisibleText();
};

Driver.prototype.get = function(path) {
  var navigate = function() {
    return this._cmd.get(this._root + path);
  }.bind(this);

  return navigate()
    .then(function() {
      return this._$('session.loginButton');
    }.bind(this))
    .then(function(loginBtn) {
      return loginBtn[0].click()
        .then(navigate);
    }.bind(this), function() {
      // If the login button is not present, the current session is already
      // authenticated and the operation is complete.
    });
};
