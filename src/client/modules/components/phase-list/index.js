'use strict';
var Ractive = require('ractive/ractive.runtime');

var weekNumber = require('../../util/week-num');
var WEEK_MS = 7 * 24 * 60 * 60 * 1000;

module.exports = Ractive.extend({
  template: require('./template.html'),
  data: {
    firstWeek: new Date(),
    _phases: null,
    numWeeks: 0
  },
  components: {
    'bp-phase-list-row': require('../phase-list-row/index')
  },
  formatPhase: function(date) {
    return {
      date: date,
      url: '/year/' + date.getFullYear() + '/week/' + 3 + '/phase/' + 4 + '/',
    };
  },
  phaseUrl: function(date) {
    return '/year/' + date.getFullYear() + '/week/' + weekNumber.fromDate(date) + '/';
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
    phases: function() {
      var first = this.get('firstWeek');
      var num = this.get('numWeeks');
      var phases = this.get('_phases');
      var viewBounds = [first.getTime()];
      viewBounds[1] = viewBounds[0] + num * WEEK_MS;

      if (!phases) {
        return;
      }

      phases = phases.filter(function(phase) {
        var phaseStart = phase.date_start.getTime();
        var phaseEnd = phaseStart + phase.calendar_weeks * WEEK_MS;
        return (phaseStart >= viewBounds[0] && phaseStart <= viewBounds[1]) ||
          (phaseEnd >= viewBounds[0] && phaseEnd <= viewBounds[1]) ||
          (phaseStart < viewBounds[0] && phaseEnd > viewBounds[1]);
      });

      return phases;
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
