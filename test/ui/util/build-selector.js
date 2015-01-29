'use strict';

/**
 * Build a CSS selector string from a structured object and a keypath.
 *
 *     var obj = {
 *       main: {
 *         _container: '#content',
 *         _contents: {
 *           heading: 'h1'
 *         }
 *       }
 *     };
 *     assert(buildSelector('main.heading', obj) === '#content h1');
 *
 * @param {string} path
 * @param {object} selectors
 *
 * @returns {String} CSS selector at the given path
 */
module.exports = function(path, selectors) {
  var idx = 0;
  var parts = path.split('.');
  var selectorParts = [];
  var value = selectors;
  var key;

  for (key = parts[idx]; idx < parts.length; key = parts[++idx]) {
    value = value[key];

    if (!value) {
      throw new Error('Invalid path: "' + path + '".');
    }

    if (value._contents) {
      if (value._selector) {
        selectorParts.push(value._selector);
      }
      value = value._contents;
    }
  }

  // When ending on a leaf node
  if (typeof value === 'string') {
    selectorParts.push(value);
  }

  return selectorParts.join(' ');
};
