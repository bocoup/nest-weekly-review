'use strict';
var Router = require('ampersand-router');
var Layout = require('./components/layout/index');
var weekNumber = require('./util/week-num');

module.exports = Router.extend({
  initialize: function(options) {
    this.layout = new Layout({
      el: options.el
    });
  },

  routes: {
    '': 'index',
    'year/:year/week/:week/': 'phaseList',
    'year/:year/week/:week/phase/:phaseId/': 'review'
  },

  index: function() {
    var now = new Date();
    var thisWeek = weekNumber.fromDate(now);

    this.phaseList(now.getFullYear(), thisWeek);
  },

  phaseList: function(year, week) {
    this.layout.set('route', 'phaseList');
    this.layout.findComponent('bp-phase-list').set({
      firstWeek: weekNumber.toDate(year, week),
      numWeeks: 5
    });
  },

  review: function(year, week, phaseId) {
    this.layout.set('route', 'review');
    this.layout.findComponent('bp-review').set({
      year: year,
      week: week,
      phaseId: phaseId
    });
  }
});
