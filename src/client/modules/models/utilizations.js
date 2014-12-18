'use strict';
var Collection = require('ampersand-rest-collection');
var extend = require('lodash.assign');

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

  atDay: function(first, offset) {
    return this.atDate(new Date(first.getTime() + offset * ONE_DAY));
  },

  /**
   * Set utilization data for a given date. This operation may result in one or
   * more models being created/destroyed based on whether consecutive dates
   * "match" (see `Utilization#match`).
   *
   * @param {Date} date
   * @param {Object} attrs - new utilization data
   * @param {Object} [options] - behavior modifiers forwarded to underlying
   *                              model/collection mutation methods
   *                              (`Model#set`, `Collection#add`, and
   *                              `Collection#remove`)
   */
  setAtDate: function(date, attrs, options) {
    var timestamp = date.getTime();
    var before = new Date(timestamp - ONE_DAY);
    var after = new Date(timestamp + ONE_DAY);
    var prev = this.atDate(before);
    var curr = this.atDate(date);
    var next = this.atDate(after);
    var withIndex = extend({ at: this.models.indexOf(prev) + 1 }, options);

    if (curr && curr.matches(attrs)) {
      return;
    }

    if (curr && curr !== prev && curr !== next) {
      this.remove(curr, options);
      curr = null;
    }

    if (prev) {
      if (prev.matches(attrs)) {
        prev.set('last_day', new Date(date));
        curr = prev;
      } else if (prev === curr) {
        if (prev === next) {
          next = prev.createMatching({
            first_day: new Date('after'),
            last_day: next.get('last_day')
          });
          this.add(next, withIndex);
        }

        prev.set('last_day', new Date(before), options);
        curr = null;
      }
    }

    if (next) {
      if (next.matches(attrs)) {
        if (curr && curr === prev) {
          curr.set('last_day', next.get('last_day'));
          this.remove(next, options);
          next = curr;
        } else {
          next.set('first_day', new Date(date), options);
          curr = next;
        }
      } else {
        next.set('first_day', new Date(after), options);
        if (curr !== prev) {
          curr = null;
        }
      }
    }

    if (!curr) {
      attrs.first_day = new Date(date);
      attrs.last_day = new Date(date);
      curr = this.add(attrs, withIndex, options);
    }

  }
});
