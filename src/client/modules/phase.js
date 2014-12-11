'use strict';
var Model = require('ampersand-model');

var Employees = require('./employees');

var WEEK_MS = 1000 * 60 * 60 * 24 * 7;

module.exports = Model.extend({
  url: function() {
    return '/api/phase/' + this.get('id');
  },
  props: {
    id: 'number',
    date_start: 'date',
    name: 'string',
    calendar_weeks: 'number',
    developer_weeks: 'number',
    project: 'object'
  },
  collections: {
    employees: Employees
  },
  derived: {
    date_end: {
      deps: ['date_start', 'calendar_weeks'],
      fn: function() {
        return new Date(
          this.get('date_start').getTime() +
          this.get('calendar_weeks') * WEEK_MS
        );
      }
    }
  },
  parse: function(attrs) {
    attrs.date_start = new Date(attrs.date_start);

    return attrs;
  },

  detectUtilizations: function() {
    var employees = this.get('employees');
    var allEmployees = this.collection && this.collection.employees;

    if (!employees || !allEmployees) {
      return;
    }

    this.employees.forEach(function(employee) {
      employee.setUtilizations(allEmployees);
    });
  }
});
