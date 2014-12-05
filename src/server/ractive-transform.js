/**
 * @file - Browserify transform for compiling HTML templates for Ractive.js
 */
'use strict';
var through = require('through');
var Ractive = require('ractive');

var pathPattern = /\.html$/i;

module.exports = function(filename) {
  var source;

  if (!pathPattern.test(filename)) {
    return through();
  }

  source = '';

  return through(function(buffer) {
    source += buffer;
  }, function() {
    this.queue(
      'module.exports = ' + JSON.stringify(Ractive.parse(source)) + ';'
    );
    this.queue(null);
  });
};
