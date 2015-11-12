'use strict';
var Model = require('ampersand-model');
var Moment = require('moment');

var Project = require('./project');
var Employees = require('./employees');
var PhaseReviews = require('./phase-reviews');
var setBearer = require('../ajax-config');
var dateStr = require('../util/date-string');

var API_ROOT = require('../api-root');

module.exports = Model.extend({
  urlRoot:  API_ROOT + '/project-phases',
  ajaxConfig: setBearer,
  dataTypes: {
    dateStr: dateStr
  },

  props: {
    id: 'number',
    name: 'string',
    first_day: 'dateStr',
    last_day: 'dateStr',
    developer_weeks: 'number'
  },
  children: {
    project: Project
  },
  collections: {
    employees: Employees,
    reviews: PhaseReviews
  },

  contains: function(date) {
    return date >= this.get('first_day') && date < this.get('last_day');
  },

  weekOffset: function(date) {
    return -1 * new Moment(this.get('first_day'))
      .startOf('week')
      .diff(date, 'weeks');
  },

  reviewAt: function(date) {
    return this.reviews.atWeek(this.weekOffset(date)) || null;
  }
});
