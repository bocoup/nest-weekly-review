'use strict';
var Model = require('ampersand-model');

var Employees = require('./employees');

var API_ROOT = require('../api-root');
var WEEK_MS = 1000 * 60 * 60 * 24 * 7;

module.exports = Model.extend({
  url: function() {
    return API_ROOT + '/project_phases/' + this.get('id');
  },
  props: {
    id: 'number',
    name: 'string',
    first_day: 'date',
    calendar_weeks: 'number',
    developer_weeks: 'number',
    project: 'object'
  },
  collections: {
    employees: Employees
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

  fetch: function(options) {
    var success = options && options.success;
    options = options || {};

    options.success = function() {
      this.employees.fetch({
        data: {
          start: this.get('first_day'),
          end: this.get('last_day')
        },
        success: success,
        error: options.error
      });
    }.bind(this);

    return Model.prototype.fetch.call(this, options);
  }
});
