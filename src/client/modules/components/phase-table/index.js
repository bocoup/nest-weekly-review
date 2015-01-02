'use strict';
var Component = require('../../util/component');
var weekNumber = require('../../util/week-num');
var WEEK_MS = 7 * 24 * 60 * 60 * 1000;

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  data: {
    firstWeek: new Date(),
    numWeeks: 0
  },
  components: {
    'bp-phase-table-row': require('../phase-table-row/index')
  },
  partials: {
    date: require('../../partials/date.html')
  },
  formatPhase: function(date) {
    return {
      date: date,
      url: '/year/' + date.getFullYear() + '/week/' + 3 + '/phase/' + 4 + '/',
    };
  },
  phaseUrl: function(date) {
    var time = weekNumber.fromDate(date);
    return '/year/' + time.year + '/week/' + time.week + '/';
  },
  computed: {
    nextWeek: function() {
      var date = new Date(this.get('firstWeek').getTime() + WEEK_MS);
      return this.phaseUrl(date);
    },
    prevWeek: function() {
      var date = new Date(this.get('firstWeek').getTime() - WEEK_MS);
      return this.phaseUrl(date);
    },
    visiblePhases: function() {
      var first = this.get('firstWeek');
      var num = this.get('numWeeks');
      var phases = this.get('phases');

      return phases.filter(function(phase) {
        var projectStart = phase.get('first_day');
        var projectEnd = phase.get('last_day');
        var untilStart = Math.round(weekNumber.between(first, projectStart));
        var untilEnd = Math.round(weekNumber.between(first, projectEnd));

        return (untilStart >= 0 && untilStart < num) ||
          (untilEnd > 0 && untilEnd < num) ||
          (untilStart <= 0 && untilEnd > 0);
      });
    },
    weeks: function() {
      var first = this.get('firstWeek');
      var num = this.get('numWeeks');
      var weeks = [];
      var idx;


      for (idx = 0; idx < num; ++idx) {
        weeks.push(
          new Date(first.getTime() + idx * WEEK_MS)
        );
      }

      return weeks;
    }
  }
});
