'use strict';
var Component = require('../../util/component');

var weekNumber = require('../../util/week-num');

var WEEK_MS = 1000 * 60 * 60 * 24 * 7;

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  partials: {
    date: require('../../partials/date.html')
  },
  reviewUrl: function(offset) {
    var phase = this.get('phase');
    var firstDay = phase.get('first_day');
    var date = new Date(firstDay.getTime() + offset * WEEK_MS);

    return '/project/' + this.get('project.id') + '/' +
      'phase/' + phase.get('id') +
      '/date/' +
        date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() +
      '/';
  },
  computed: {
    weeks: function() {
      var viewWidth = this.get('data-num-weeks');
      var viewStart = this.get('data-first-week');
      var phaseStart = this.get('phase.first_day');
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
