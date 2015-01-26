'use strict';
var browserify = require('browserify');

var cssTransform = require('./transforms/css');
var ractiveTransform = require('./transforms/ractive');

/**
 * Create a readable stream describing the built application.
 *
 * @param {Array} [replacements] Any number of "stream"-"module identifier"
 *                pairs to inject into the build.
 *
 * @returns {ReadableStream}
 */
module.exports = function(replacements) {
  var b = browserify('./src/client/modules/main.js');

  b.transform(cssTransform);
  b.transform(ractiveTransform);
  b.transform('envify');

  if (replacements) {
    replacements.forEach(function(replacement) {
      b.require(replacement.file, { expose: replacement.expose });
    });
  }

  return b.bundle();
};

if (require.main === module) {
  module.exports().pipe(process.stdout);
}
