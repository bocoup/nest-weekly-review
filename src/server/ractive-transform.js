/**
 * @file - Browserify transform for compiling HTML templates for Ractive.js
 */
'use strict';
var through = require('through');
var Ractive = require('ractive');

var pathPattern = /\.html$/i;

function errorTemplate(filename, err) {
  return [
    '<div style="',
      'font-weight: bold !important;',
      'display: block !important;',
      'color: red !important;',
    '">',
      'Ractive Compilation Error:',
      filename,
    '</div>',
    // The error string likely has mustaches, so the delimiter should be
    // changed.
    '{{=[[ ]]=}}',
    '<pre>',
      err,
    '</pre>'
  ].join('');
}

module.exports = function(filename) {
  var source;

  if (!pathPattern.test(filename)) {
    return through();
  }

  source = '';

  return through(function(buffer) {
    source += buffer;
  }, function() {
    var compiled;

    try {
      compiled = Ractive.parse(source);
    } catch(err) {
      compiled = Ractive.parse(errorTemplate(filename, err));
    }

    this.queue(
      'module.exports = ' + JSON.stringify(compiled) + ';'
    );
    this.queue(null);
  });
};
