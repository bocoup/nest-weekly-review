'use strict';
var Component = require('../../util/component');

var weekNumber = require('../../util/week-num');

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  partials: {
    date: require('../../partials/date.html')
  },
  reviewUrl: function(offset) {
    return '/phase/' + this.get('phase.id') + '/week/' + offset +'/';
  },
  computed: {
    weeks: function() {
      var viewWidth = this.get('data-num-weeks');
      var viewStart = this.get('data-first-week');
      var phaseStart = this.get('phase.date_start');
      var between = Math.round(weekNumber.between(phaseStart, viewStart));
      var phaseLength = this.get('phase.calendar_weeks');
      var weeks = [];
      var weekOffset, idx;

      for (idx = 0; idx < viewWidth; ++idx) {
        weekOffset = between + idx;
        weeks.push({
          isActive: weekOffset >= 0 && weekOffset < phaseLength,
          reviewUrl: this.reviewUrl(weekOffset)
        });
      }

      return weeks;
    }
  }
});
