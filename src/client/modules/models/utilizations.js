'use strict';
var Collection = require('ampersand-rest-collection');
var Promise = require('ractive/ractive.runtime').Promise;
var extend = require('lodash.assign');

var Utilization = require('./utilization');
var parse = require('../util/parse-json-api-resp')('utilizations');
var setBearer = require('../ajax-config');
var API_ROOT = require('../api-root');

var ONE_DAY = 1000 * 60 * 60 * 24;

module.exports = Collection.extend({
  model: Utilization,
  url: API_ROOT + '/utilizations',
  ajaxConfig: setBearer,
  comparator: 'first_day',

  initialize: function() {
    this._removed = [];
    this.on('_remove remove', function(model) {
      this._removed.push(model);
    });
  },

  parse: parse,

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
   * Destroy any models that have been removed since the last invocation of
   * this method, then save changes to existing models, then save new models.
   * Each set of operations only takes place once the previous set is
   * complete--this avoids creating invalid utilization states on the server.
   *
   * @returns {Promise}
   */
  save: function() {
    var destroyRequests = [];

    this._removed.forEach(function(model) {
      // Account for possibility that the model may have been re-inserted into
      // this collection.
      if (model.collection === this) {
        return;
      }

      destroyRequests.push(model.destroy());
    }, this);

    this._removed.length = 0;

    return Promise.all(destroyRequests).then(function() {
      var changing = this.filter(function(model) {
        return model.isDirty() && !model.isNew();
      });

      return safeUpdate(changing);
    }.bind(this)).then(function() {
      var createRequests = [];

      this.forEach(function(model) {
        // Don't bother saving previously-existing models that have not
        // changed.
        if (!model.isNew()) {
          return;
        }

        createRequests.push(model.save());
      });

      return Promise.all(createRequests);
    }.bind(this));
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
    return atDate(this.models, date, offset);
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
          next = this.split(new Date(after), options);
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

    if (!curr && attrs) {
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
   * @param {Object} [options] - behavior modifiers forwarded to underlying
   *                             model/collection mutation methods
   *                             (`Model#set`, `Collection#add`, and
   *                             `Collection#remove`)
   */
  verify: function(firstDay, through, options) {
    var idx, utilization, currentDay, prevDay;

    if (typeof through !== 'number') {
      options = through;
      through = 1;
    }

    // Split utilizations at either end of the period (when necessary)
    this.split(firstDay, options);
    this.split(new Date(firstDay.getTime() + ONE_DAY * through), options);

    for (idx = 0; idx < through; ++idx) {
      prevDay = currentDay || new Date(firstDay.getTime() - ONE_DAY);
      currentDay = new Date(firstDay.getTime() + ONE_DAY * idx);
      utilization = this.atDate(currentDay);

      if (utilization && !utilization.get('verified')) {
        utilization.set('verified', true, options);
      }
    }
  }
});

/**
 * Retrieve the Utilization model that includes the given date if such a model
 * is present in the array.
 *
 * @param {Array<Utilization>} models
 * @param {Date} date
 * @param {number} [offset] number of days after the supplied date for which to
 *                          find utilization data. Defaults to `0`.
 *
 * @returns {Utilization|null}
 */
function atDate(models, date, offset) {
  var idx, length, current;

  if (offset) {
    date = new Date(date.getTime() + offset * ONE_DAY);
  }

  for (idx = 0, length = models.length; idx < length; ++idx) {
    current = models[idx];
    if (current.includes(date)) {
      return current;
    }
  }

  return null;
}

/**
 * Update a set of models in distinct "passes" to avoid creating invalid state
 * on the server (one where two different utilization models include the same
 * day).
 *
 * @param {Array<Utilization>} models Utilization models that should be saved
 *
 * @returns {Promise} Resolved when all models have been saved. Rejected when
 *                    any single save operation fails
 */
function safeUpdate(models) {
  var serverState = models.map(function(model) {
    return new Utilization(model.previousAttributes());
  });
  var canUpdate = [];
  var mustWait = [];

  models.forEach(function(model) {
    var firstDay = model.get('first_day');
    var lastDay = model.get('last_day');
    var others = serverState.slice();
    others.splice(models.indexOf(model), 1);

    if ((!firstDay || !atDate(others, firstDay)) &&
      (!lastDay || !atDate(others, lastDay))) {
      canUpdate.push(model);
    } else {
      mustWait.push(model);
    }
  });

  return Promise.all(canUpdate.map(function(model) { return model.save(); }))
    .then(function() {
      if (mustWait.length) {
        return safeUpdate(mustWait);
      }
    });
}
