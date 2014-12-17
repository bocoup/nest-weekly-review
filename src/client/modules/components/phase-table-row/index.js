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
    var url = '/project/' + this.get('project.id') + '/';
    var phase = this.get('phase');

    if (phase) {
      url += 'phase/' + phase.get('id') + '/';
    }

    return url + 'week/' + offset +'/';
  },
  computed: {
    date_start: function() {
      return this.get('phase.date_start') || this.get('project.date_start');
    },
    date_end: function() {
      return this.get('phase.date_end') || this.get('project.date_end');
    },
    weeks: function() {
      var viewWidth = this.get('data-num-weeks');
      var viewStart = this.get('data-first-week');
      var phaseStart = this.get('date_start');
      var between = Math.round(weekNumber.between(phaseStart, viewStart));
      var phaseLength = this.get('phase.calendar_weeks') ||
        this.get('project.calendar_weeks');
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
