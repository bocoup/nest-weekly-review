'use strict';
var Collection = require('ampersand-rest-collection');
var Utilization = require('./utilization');

var ONE_DAY = 1000 * 60 * 60 * 24;

module.exports = Collection.extend({
  model: Utilization,

  initialize: function() {
    this._removed = [];
    this.on('remove', function(model) {
      this._removed.push(model);
    });
  },

  /**
   * Save all the models currently in the collection and destroy any models
   * that have been removed since the last invocation of this method.
   */
  save: function() {
    this.forEach(function(model) {
      model.save();
    });

    this._removed.forEach(function(model) {
      // Account for possibility that model may have been re-inserted into
      // collection.
      if ('collection' in model) {
        return;
      }

      model.destroy();
    });

    this._removed.length = 0;
  },

  /**
   * Retrieve the Utilization model that includes the given date if such a
   * model is present in the collection.
   *
   * @param {Date} date
   * @param {number} [offset] number of days after the supplied date for which
   *                          to find utilization data. Defaults to `0`.
   *
   * @returns {Utilization|null}
   */
  atDate: function(date, offset) {
    var idx, length, current;

    if (offset) {
      date = new Date(date.getTime() + offset * ONE_DAY);
    }

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
        this.remove(next);
        prev.set('last_day', new Date(after));
      } else {
        prev.set('last_day', new Date(date));
        next.set('first_day', new Date(after));
      }
      if (next !== curr) {
        this.remove(curr);
      }
    } else {
      if (prev !== curr) {
        this.remove(curr);
      }
      prev.set('last_day', new Date(before));
      next.set('first_day', new Date(date));
    }
  }
});
