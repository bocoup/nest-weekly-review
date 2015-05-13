'use strict';
var extend = require('lodash.assign');

/**
 * Define a new property (or extend an existing one) on an object or one of its
 * properties, interpreting period characters (".") in the the provided "path"
 * as attribute separators (creating intermediate objects when necessary). For
 * instance:
 *
 * var obj = {};
 * extendAt(obj, 'a', {});          // `obj.a` is now an empty object
 * extendAt(obj, 'a.b', {});        // `obj.a.b` is now an empty object
 * extendAt(obj, 'a.b.c', 23);      // `obj.a.b.c` is now `23`
 * extendAt(obj, 'x.y.z', 45);      // `obj.x.y.z` is now `45`
 * extendAt(obj, 'x.y', { w: 33 }); // `obj.x.y.w` is now `33;
 *                                  // `obj.x.y.z` is still `45`
 *
 * @param {Object} root The object from which the path should be interpreted
 * @param {string} path The period-separated collection of attributes to use to
 *                      traverse into the `root` object. If this resolves to an
 *                      object, that object will be extended with the provided
 *                      `value`
 * @param {mixed} value The value to define at the property described by `path`
 */
function extendAt(root, path, value) {
  var parts = path.split('.');
  var last = parts.pop();

  var parent = parts.reduce(function(curr, next) {
    if (!(next in curr)) {
      curr[next] = {};
    }

    return curr[next];
  }, root);

  if (typeof parent[last] === 'object') {
    extend(parent[last], value);
  } else {
    parent[last] = value;
  }
}

function inflate(linkedLookups, key, value) {
  var lookup, keyParts;

  if (value === null || value === undefined) {
    return value;
  }

  keyParts = key.split('.');

  if (keyParts.length > 1) {
    key = keyParts[keyParts.length - 1];
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return linkedLookups[key][value];
  }

  lookup = linkedLookups[value.type];

  if (!lookup) {
    return null;
  }

  if (value.ids) {
    return value.ids.map(function(id) { return lookup[id]; });
  }

  return lookup[value.id] || null;
}

module.exports = function(name, data) {
  var reps, linked, linkedLookups;

  // TODO: Investigate when this occurs
  if (!data) {
    return;
  }

  reps = data[name];
  linked = data.linked;

  // When data is fetched through a collection, it will first be parsed
  // according to that collection's `parse` method (if any) and then parsed
  // according to the model's `parse` method (if any). This means a Model's
  // `parse` method will be superfluous when the data originates from a
  // parent collection's `fetch` method.
  if (!reps) {
    return data;
  }

  if (linked) {
    linkedLookups = {};
    Object.keys(linked).forEach(function(attr) {
      var lookup = linkedLookups[attr] = {};

      linked[attr].forEach(function(rep) {
        lookup[rep.id] = rep;
      });
    });

    reps.forEach(function(rep) {
      Object.keys(rep.links).forEach(function(attr) {
        var links = rep.links[attr];
        var inflated;

        if (Array.isArray(links)) {
          inflated = links.map(function(linkValue) {
            return inflate(linkedLookups, attr, linkValue);
          });
        } else {
          inflated = inflate(linkedLookups, attr, links);
        }

        extendAt(rep, attr, inflated);
        delete rep.links[attr];
      });
    });
  }

  if (Array.isArray(reps)) {
    reps.forEach(function(rep) {
      delete rep.links;
    });
  } else {
    delete reps.links;
  }

  return reps;
};
