'use strict';
var build = require('../../build/build');

module.exports = function(req, res) {
  build().pipe(res);
};
