'use strict';
var Ractive = require('ractive/ractive.runtime');

var weekNumber = require('../../util/week-num');
var WEEK_MS = 7 * 24 * 60 * 60 * 1000;

module.exports = Ractive.extend({
  template: require('./template.html'),
  data: {
    firstWeek: new Date(),
    numWeeks: 0
  },
  formatPhase: function(date) {
    return {
      date: date,
      url: '/year/' + date.getFullYear() + '/week/' + 3 + '/phase/' + 4 + '/',
    };
  },
  reviewUrl: function(date) {
    return '/year/' + date.getFullYear() + '/week/' + weekNumber.fromDate(date) + '/';
  },
  computed: {
    nextWeek: function() {
      var date = new Date(this.get('firstWeek').getTime() + WEEK_MS);
      return this.reviewUrl(date);
    },
    prevWeek: function() {
      var date = new Date(this.get('firstWeek').getTime() - WEEK_MS);
      return this.reviewUrl(date);
    },
    phases: function() {
      var first = this.get('firstWeek');
      var num = this.get('numWeeks');
      var phases = [];
      var idx;

      for (idx = 0; idx < num; ++idx) {
        phases.push(
          this.formatPhase(new Date(first.getTime() + idx * WEEK_MS))
        );
      }

      return phases;
    }
  }
});
