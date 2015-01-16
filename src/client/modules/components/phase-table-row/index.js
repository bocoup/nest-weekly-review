'use strict';
var Component = require('../../util/component');

var weekNumber = require('../../util/week-num');

var DAY_MS = 1000 * 60 * 60 * 24;
var WEEK_MS = DAY_MS * 7;

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  partials: {
    date: require('../../partials/date.html')
  },
  reviewUrl: function(offset) {
    var phase = this.get('phase');
    var sunday = weekNumber.sundayOf(
      new Date(+phase.get('first_day') + offset * WEEK_MS)
    );

    return '/date/' + sunday.toISOString().replace(/T.*$/, '') +
      '/phase/' + phase.get('id') + '/';
  },
  computed: {
    weeks: function() {
      var viewWidth = this.get('data-num-weeks');
      var viewStart = this.get('data-first-week');
      var phaseStart = this.get('phase.first_day');
      var between = Math.round(weekNumber.between(phaseStart, viewStart));
      var phaseLength = this.get('phase.calendar_weeks');
      var weeks = [];
      var weekOffset, idx, isActive, review;

      for (idx = 0; idx < viewWidth; ++idx) {
        weekOffset = between + idx;
        isActive = weekOffset >= 0 && weekOffset < phaseLength;
        review = null;

        // As an optimization, only look up reviews for weeks on which the
        // phase is active.
        if (isActive) {
          review = this.get('phase').reviews.atWeek(weekOffset);
        }

        weeks.push({
          isActive: isActive,
          review: review,
          reviewUrl: this.reviewUrl(weekOffset)
        });
      }

      return weeks;
    }
  }
});
