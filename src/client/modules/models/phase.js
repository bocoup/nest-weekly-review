'use strict';
var Model = require('ampersand-model');

var Employees = require('./employees');
var weekNum = require('../util/week-num');

var API_ROOT = require('../api-root');
var WEEK_MS = 1000 * 60 * 60 * 24 * 7;

module.exports = Model.extend({
  url: function() {
    return API_ROOT + '/project_phases/' + this.get('id');
  },
  props: {
    id: 'number',
    name: 'string',
    first_calendar_week: 'number',
    year: 'number',
    calendar_weeks: 'number',
    developer_weeks: 'number',
    project: 'object'
  },
  collections: {
    employees: Employees
  },
  derived: {
    date_start: {
      deps: ['year', 'first_calendar_week'],
      fn: function() {
        return weekNum.toDate(
          this.get('year'), this.get('first_calendar_week')
        );
      }
    },
    date_end: {
      deps: ['year', 'first_calendar_week', 'calendar_weeks'],
      fn: function() {
        var year = this.get('year');
        var week = this.get('first_calendar_week') + this.get('calendar_weeks');

        if (week > 52) {
          year += 1;
          week -= 52;
        }

        return weekNum.toDate(year, week);
      }
    }
  },

  fetch: function(options) {
    var success = options && options.success;
    options = options || {};

    options.success = function() {
      this.employees.fetch({
        data: {
          start: this.get('date_start'),
          end: this.get('date_end')
        },
        success: function() {
          this.detectUtilizations();
          success && sucess();
        }.bind(this)
      })
    }.bind(this);

    return Model.prototype.fetch.call(this, options);
  },

  detectUtilizations: function() {
    var employees = this.get('employees');
    var allEmployees = this.collection && this.collection.employees;

    if (!employees || !allEmployees) {
      return;
    }

    this.employees.forEach(function(employee) {
      //employee.setUtilizations(allEmployees);
    });
  }
});
