'use strict';
var Model = require('ampersand-model');

var Project = require('./project');
var Employees = require('./employees');
var PhaseReviews = require('./phase-reviews');
var setBearer = require('../ajax-config');
var weekNum = require('../util/week-num');

var API_ROOT = require('../api-root');
var WEEK_MS = 1000 * 60 * 60 * 24 * 7;

module.exports = Model.extend({
  url: function() {
    return API_ROOT + '/project-phases/' + this.get('id');
  },
  ajaxConfig: setBearer,

  props: {
    id: 'number',
    name: 'string',
    first_day: 'date',
    calendar_weeks: 'number',
    developer_weeks: 'number'
  },
  children: {
    project: Project
  },
  collections: {
    employees: Employees,
    reviews: PhaseReviews
  },
  derived: {
    last_day: {
      deps: ['first_day', 'calendar_weeks'],
      fn: function() {
        var firstDay = this.get('first_day');
        var numWeeks = this.get('calendar_weeks');

        return new Date(
          firstDay.getTime() + numWeeks * WEEK_MS
        );
      }
    }
  },

  reviewAt: function(date) {
    var thisOffsets = weekNum.fromDate(this.get('first_day'));
    var thatOffsets = weekNum.fromDate(date);
    var weekOffset = (thatOffsets.week - thisOffsets.week) +
      (thatOffsets.year - thisOffsets.year) * 52;
    return this.reviews.atWeek(weekOffset) || null;
  }
});
