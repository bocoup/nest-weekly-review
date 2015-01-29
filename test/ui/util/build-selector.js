'use strict';

/**
 * Build a CSS selector string from a structured object and a keypath. This
 * selector string may optionally be relative to a string at an existing path.
 *
 *     var obj = {
 *       main: {
 *         _container: '#content',
 *         _contents: {
 *           heading: 'h1'
 *         }
 *       }
 *     };
 *     assert(buildSelector(obj, 'main.heading') === '#content h1');
 *     assert(buildSelector(obj, 'main', 'heading') === 'h1');
 *
 * @param {object} selectors
 * @param {string} [context]
 * @param {string} path
 *
 * @returns {String} CSS selector at the given path
 */
module.exports = function(selectors, context, path) {
  var value = selectors;
  var selectorParts = [];
  var idx = 0;
  var ignore = 0;
  var key, parts;

  if (!path) {
    path = context;
    context = null;
  }

  parts = path.split('.');

  if (context) {
    ignore = context.length;
    parts.unshift.apply(parts, context.split('.'));
  }

  for (key = parts[idx]; idx < parts.length; key = parts[++idx]) {
    value = value[key];

    if (!value) {
      throw new Error('Invalid path: "' + path + '".');
    }

    if (value._contents) {
      if (value._selector && ignore < 1) {
        selectorParts.push(value._selector);
      }
      ignore--;
      value = value._contents;
    }
  }

  // When ending on a leaf node
  if (typeof value === 'string') {
    selectorParts.push(value);
  }

  return selectorParts.join(' ');
};
