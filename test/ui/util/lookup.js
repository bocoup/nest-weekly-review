'use strict';

/**
 * Dereference an object according to a period-separated path.
 *
 *     var obj = { a: b: { c:23 } };
 *     assert(lookup('a.b.c', obj) === 23);
 *
 * @param {string} path
 * @param {object} object
 *
 * @returns {mixed} Value at the given path
 */
module.exports = function(path, object) {
  var parts = path.split('.');
  var idx = 0;
  var value = object;
  var key;

  for (key = parts[idx]; idx < parts.length; key = parts[++idx]) {
    value = value[key];
  }

  return value;
};
