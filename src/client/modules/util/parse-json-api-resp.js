'use strict';

function inflate(linkedLookups, key, value) {
  var lookup;

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {

    // TODO: Remove these hard-coded translations once the API begins using the
    // `"type"` field.
    if (key === 'project') {
      key = 'projects';
    } else if (key === 'type') {
      key = 'utilization_types';
    }

    return linkedLookups[key][value];
  }

  lookup = linkedLookups[value.type];

  if (value.ids) {
    return value.ids.map(function(id) { return lookup[id]; });
  }

  return lookup[value.id] || null;
}

module.exports = function(name) {
  return function(data) {
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

          rep[attr] = inflated;
          delete rep.links[attr];
        });

        delete rep.links;
      });
    }

    return reps;
  };
};
