'use strict';
var Component = require('../../util/component');

var Moment = require('moment');

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  partials: {
    date: require('../../partials/date.html')
  },

  sundayFromWeekOffset: function(offset) {
    return new Moment(+this.get('phase.first_day'))
      .add(offset, 'weeks')
      .startOf('week')
      .toDate();
  },
  reviewUrl: function(offset) {
    var phase = this.get('phase');
    var sunday = this.sundayFromWeekOffset(offset);

    return '/date/' + sunday.toISOString().replace(/T.*$/, '') +
      '/phase/' + phase.get('id') + '/';
  },
  computed: {
    weeks: function() {
      var viewWidth = this.get('data-num-weeks');
      var viewStart = new Moment(this.get('data-first-week'));
      var phaseStart = new Moment(this.get('phase.first_day'));
      var between = Math.ceil(
        viewStart.diff(phaseStart, 'weeks', true)
      );
      var phaseLength = Math.ceil(
        new Moment(this.get('phase.last_day')).diff(phaseStart, 'weeks', true)
      );
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
          isFirst: weekOffset === 0,
          isLast: weekOffset === phaseLength - 1,
          review: review,
          sunday: this.sundayFromWeekOffset(weekOffset),
          reviewUrl: this.reviewUrl(weekOffset)
        });
      }

      return weeks;
    }
  },

  handleWeekHover: function(isActive, phase, date) {
    if (!isActive) {
      return;
    }

    this.fire('brushPhase', phase, date);
  }
});
