'use strict';
var Collection = require('ampersand-rest-collection');

var PhaseReview = require('./phase-review');

var WEEK_MS = 1000 * 60 * 60 * 24 * 7;

module.exports = Collection.extend({
  model: PhaseReview,

  /**
   * Retrieve the review that describes a given date, if any.
   *
   * @param {Date|number} date The moment in time for which to find a review.
   *                           If specified as a number, the value is
   *                           interpreted as a Unix timestamp.
   *
   * @returns {PhaseReview|null}
   */
  forDate: function(date) {
    var time;

    if (date.getTime) {
      time = date.getTime();
    } else {
      time = date;
    }

    return this.find(function(review) {
      var offset = time - review.get('first_day').getTime();
      return offset >= 0 && offset < WEEK_MS;
    }) || null;
  }
});
