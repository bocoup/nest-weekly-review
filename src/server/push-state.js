'use strict';
var url = require('url');

/**
 * Re-write directory requests to the project root. The client-side code served
 * from the index is capable of rendering the correct page based on the initial
 * URL. This enables direct access (via external link) to specific application
 * pages.
 */
module.exports = function(req, res, next) {
  var parts;
  if (/\/$/.test(req.path)) {
    parts = url.parse(req.url);
    parts.pathname = '/';
    req.url = url.format(parts);
  }
  next();
};
