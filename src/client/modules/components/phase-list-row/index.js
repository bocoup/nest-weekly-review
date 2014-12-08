'use strict';
var Ractive = require('ractive/ractive.runtime');

var weekNumber = require('../../util/week-num');
var WEEK_MS = 7 * 24 * 60 * 60 * 1000;

module.exports = Ractive.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  reviewUrl: function(date) {
    return '/year/' + date.getFullYear() +
      '/week/' + weekNumber.fromDate(date) +
      '/phase/' + this.get('id') + '/';
  },
  computed: {
    weeks: function() {
      var firstWeek = this.get('data-first-week').getTime();
      var phaseStart = this.get('date_start').getTime();
      var numWeeks = parseInt(this.get('data-num-weeks', 10));
      var phaseDuration = this.get('date_end') - phaseStart;
      var weeks = [];
      var idx, weekStart, msFromStart;

      for (idx = 0; idx < numWeeks; ++idx) {
        weekStart = firstWeek + idx * WEEK_MS;
        msFromStart = weekStart - phaseStart;
        weeks.push({
          isActive: msFromStart > -WEEK_MS && msFromStart < phaseDuration,
          reviewUrl: this.reviewUrl(new Date(weekStart))
        });
      }
      return weeks;
    }
  }
});
