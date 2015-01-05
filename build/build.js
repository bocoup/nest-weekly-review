'use strict';
var browserify = require('browserify');

var cssTransform = require('./transforms/css');
var ractiveTransform = require('./transforms/ractive');

module.exports = function() {
  var b = browserify('./src/client/modules/main.js');

  b.transform(cssTransform);
  b.transform(ractiveTransform);
  b.transform('envify');

  return b.bundle();
};

if (require.main === module) {
  module.exports().pipe(process.stdout);
}
