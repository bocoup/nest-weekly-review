'use strict';
var Collection = require('ampersand-collection');
var Utilization = require('./utilization');

var ONE_DAY = 1000 * 60 * 60 * 24;

module.exports = Collection.extend({
  model: Utilization,

  /**
   * Retrieve the Utilization model that includes the given date if such a
   * model is present in the collection.
   *
   * @param {Date} date
   *
   * @returns {Utilization|null}
   */
  atDate: function(date) {
    var idx, length, current;

    for (idx = 0, length = this.length; idx < length; ++idx) {
      current = this.at(idx);
      if (current.includes(date)) {
        return current;
      }
    }

    return null;
  },

  /**
   * Set utilization data for a given date. This operation may result in one or
   * more models being created/destroyed based on whether consecutive dates
   * "match" (see `Utilization#match`).
   *
   * @param {Date} date
   * @param {Object} attrs - new utilization data
   */
  setAtDate: function(date, attrs) {
    var timestamp = date.getTime();
    var before = new Date(timestamp - ONE_DAY);
    var after = new Date(timestamp + ONE_DAY);
    var prev = this.atDate(before);
    var curr = this.atDate(date);
    var next = this.atDate(after);
    var index = this.models.indexOf(prev) + 1;
    var nextAttrs;

    if (curr.matches(attrs)) {
      return;
    }

    if (!prev.matches(attrs) && !next.matches(attrs)) {
      if (prev === next) {
        nextAttrs = prev.toJSON();
        delete nextAttrs.id;
        nextAttrs.first_day = new Date(after);
        this.add(nextAttrs, { at: index });
        prev.set('last_day', new Date(before));
      } else {
        if (prev !== curr && next !== curr) {
          // TODO: Ensure that this gets destroyed on the server.
          this.remove(curr);
        }

        prev.set('last_day', new Date(before));
        next.set('first_day', new Date(after));
      }

      attrs.first_day = new Date(date);
      attrs.last_day = new Date(date);
      this.add(attrs, { at: index });
    } else if (prev.matches(attrs)) {
      if (next.matches(attrs)) {
        // TODO: Ensure that this gets destroyed on the server.
        this.remove(next);
        prev.set('last_day', new Date(after));
      } else {
        prev.set('last_day', new Date(date));
        next.set('first_day', new Date(after));
      }
      if (next !== curr) {
        // TODO: Ensure that this gets destroyed on the server.
        this.remove(curr);
      }
    } else {
      if (prev !== curr) {
        // TODO: Ensure that this gets destroyed on the server.
        this.remove(curr);
      }
      prev.set('last_day', new Date(before));
      next.set('first_day', new Date(date));
    }
  }
});
