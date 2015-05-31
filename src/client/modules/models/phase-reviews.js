'use strict';
var JsonApiCollection = require('./abstract/nest-api-collection');

var PhaseReview = require('./phase-review');

module.exports = JsonApiCollection.extend({
  modelType: 'project-phase-reviews',
  model: PhaseReview,

  /**
   * Retrieve the review that describes a given week, if any.
   *
   * @param {number|string} weekNumber The week offset within the phase's
   *                                   project
   *
   * @returns {PhaseReview|null}
   */
  atWeek: function(weekNumber) {
    return this.find(function(review) {
      return review.get('week_number') === +weekNumber;
    }) || null;
  }
});
