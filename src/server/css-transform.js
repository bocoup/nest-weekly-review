/**
 * @file - Browserify transform for inlining CSS
 */
'use strict';
var through = require('through');

var pathPattern = /\.css$/i;

module.exports = function(filename) {
  var source;

  if (!pathPattern.test(filename)) {
    return through();
  }

  source = '';

  return through(function(chunk) {
    source += chunk;
  }, function() {
    this.queue('module.exports = ' + JSON.stringify(source) + ';');
    this.queue(null);
  });
};
