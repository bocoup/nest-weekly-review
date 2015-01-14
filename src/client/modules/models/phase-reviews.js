'use strict';
var Collection = require('ampersand-rest-collection');

var PhaseReview = require('./phase-review');

module.exports = Collection.extend({
  model: PhaseReview,

  /**
   * Retrieve the review that describes a given week, if any.
   *
   * @param {number|string|} weekNumber The week offset within the phase's
   *                                    project
   *
   * @returns {PhaseReview|null}
   */
  atWeek: function(weekNumber) {
    return this.find(function(review) {
      return review.get('week_number') === +weekNumber;
    }) || null;
  }
});
