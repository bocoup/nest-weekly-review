'use strict';
var Moment = require('moment');

var Component = require('../../util/component');

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  data: {
    phaseUrl: function(offset) {
      var dateStr = new Moment(this.get('firstWeek'))
        .startOf('week')
        .add(offset, 'weeks')
        .format('YYYY-MM-DD');
      return '/date/' + dateStr + '/';
    }
  },
  components: {
    'wr-phase-table-row': require('../phase-table-row/index'),
    'week-heading': require('../week-heading')
  },
  partials: {
    date: require('../../partials/date.html')
  },

  onconstruct: function() {
    this.on('wr-phase-table-row.brushPhase', this.setWeekHeading.bind(this));
  },

  setWeekHeading: function(phase, date) {
    var heading = this.findComponent('week-heading');

    if (!heading) {
      return;
    }

    heading.set({
      phase: phase,
      date: date
    });
  },

  computed: {
    visiblePhases: function() {
      var first = new Moment(this.get('firstWeek'));
      var num = this.get('numWeeks');
      var phases = this.get('phases');

      return phases.filter(function(phase) {
        var projectStart = phase.get('first_day');
        var projectEnd = phase.get('last_day');
        var untilStart = -1 * first.diff(projectStart, 'weeks');
        var untilEnd = -1 * Math.round(first.diff(projectEnd, 'weeks', true));

        return (untilStart >= 0 && untilStart < num) ||
          (untilEnd > 0 && untilEnd < num) ||
          (untilStart <= 0 && untilEnd > 0);
      });
    },
    weeks: function() {
      var first = new Moment(this.get('firstWeek')).startOf('week');
      var num = this.get('numWeeks');
      var weeks = [];
      var idx;

      for (idx = 0; idx < num; ++idx) {
        weeks.push(first.clone().add(idx, 'weeks').toDate());
      }

      return weeks;
    }
  }
});
