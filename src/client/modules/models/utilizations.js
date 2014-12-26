'use strict';
var Collection = require('ampersand-rest-collection');
var Promise = require('ractive/ractive.runtime').Promise;
var extend = require('lodash.assign');

var Utilization = require('./utilization');

var ONE_DAY = 1000 * 60 * 60 * 24;

module.exports = Collection.extend({
  model: Utilization,

  initialize: function() {
    this._removed = [];
    this.on('_remove remove', function(model) {
      this._removed.push(model);
    });
  },

  /**
   * This collection tracks all models that have been removed from it. Because
   * consumer code may silence the `remove` event standard to all Collections,
   * publish a `_remove` event intended for internal use only.
   */
  remove: function(model, options) {
    var val = Collection.prototype.remove.apply(this, arguments);

    if (options && options.silent) {
      this.trigger('_remove', model);
    }

    return val;
  },

  /**
   * Save all the models currently in the collection and destroy any models
   * that have been removed since the last invocation of this method.
   *
   * @returns {Promise}
   */
  save: function() {
    var requests = [];
    var removed = this._removed;

    this.forEach(function(model) {
      // Don't bother saving previously-existing models that have not changed.
      if (!model.isNew() && !model.hasChanged()) {
        return;
      }

      requests.push(new Promise(function(resolve, reject) {
        model.save(null, { success: resolve, error: reject });
      }));
    });

    this._removed.forEach(function(model) {
      // Account for possibility that model may have been re-inserted into
      // collection.
      if ('collection' in model) {
        return;
      }

      requests.push(new Promise(function(resolve, reject) {
        model.destroy({
          success: function() {
            var index = removed.indexOf(model);
            removed.splice(index, 1);
            resolve();
          },
          error: reject
        });
      }));
    });

    return Promise.all(requests);
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
   *
   * @returns {Utilization} the model describing utilization for the specified
   *                        `date` after the set operation has completed.
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
      return curr;
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
      curr = this.add(attrs, withIndex);
    }

    return curr;
  },

  /**
   * Ensure there is a utilization that begins on the specified date. This is
   * a no-op unless a utilization exists at the given date but has a
   * `first_day` at some previous date.
   *
   * In that case, create a new, matching utilization that begins on the
   * specified date and insert it at the appropriate index in the collection.
   * Update the previously-existing utilization to end one day prior to the
   * specified date (avoiding overlap).
   *
   * @param {Date} splitDate
   * @param {Object} [options] - behavior modifiers forwarded to underlying
   *                             model/collection mutation methods
   *                             (`Model#set`, `Collection#add`, and
   *                             `Collection#remove`)
   *
   * @returns {null|Utilization} The newly-created utilization (if any)
   */
  split: function(splitDate, options) {
    var preSplitDate = new Date(splitDate.getTime() - ONE_DAY);
    var first = this.atDate(splitDate);
    var previous = this.atDate(preSplitDate);
    var newUtilization;

    if (!first || first !== previous) {
      return null;
    }

    newUtilization = first.createMatching({
      first_day: splitDate,
      last_day: first.get('last_day')
    });
    first.set('last_day', preSplitDate, options);
    this.add(newUtilization, extend({ at: this.indexOf(first) + 1 }, options));

    return newUtilization;
  },

  /**
   * Verify utilizations (i.e. set the `verified` property of the `Utilization`
   * model) existing in the specified date range.
   *
   * @param {Date} firstDay The first date whose utilization should be verified
   * @param {number} [through] The number of consecutive days to verify,
   *                           inclusive of the `firstDay`. Defaults to `1`
   *                           (i.e. only the specified date is verified)
   */
  verify: function(firstDay, through) {
    var idx, utilization, newUtilization, currentDay, prevDay, finalDay,
        firstUtil, finalUtil;

    if (arguments.length < 2) {
      through = 1;
    }

    finalDay = new Date(firstDay.getTime() + ONE_DAY * (through - 1));

    // Split utilizations at either end of the period (when necessary)
    firstUtil = this.atDate(firstDay);
    if (firstUtil &&
      firstUtil.get('first_day').getTime() !== firstDay.getTime()) {
      newUtilization = firstUtil.createMatching({
        first_day: firstDay,
        last_day: firstUtil.get('last_day')
      });
      firstUtil.set('last_day', new Date(firstDay.getTime() - ONE_DAY));
      this.add(newUtilization, this.indexOf(firstUtil) + 1);
    }
    finalUtil = this.atDate(finalDay);
    if (finalUtil &&
      finalUtil.get('last_day').getTime() !== finalDay.getTime()) {
      newUtilization = finalUtil.createMatching({
        first_day: finalUtil.get('first_day'),
        last_day: finalDay
      });
      finalUtil.set('first_day', new Date(finalDay.getTime() + ONE_DAY));
      this.add(newUtilization, { at: this.indexOf(finalUtil) });
    }

    for (idx = 0; idx < through; ++idx) {
      prevDay = currentDay || new Date(firstDay.getTime() - ONE_DAY);
      currentDay = new Date(firstDay.getTime() + ONE_DAY * idx);
      utilization = this.atDate(currentDay);

      if (utilization) {
        utilization.set('verified', true);
      }
    }
  }
});
