'use strict';
var Model = require('ampersand-model');

var Phases = require('./phases');

var API_ROOT = require('../api-root');
var WEEK_MS = 1000 * 60 * 60 * 24 * 7;

module.exports = Model.extend({
  url: function() {
    return API_ROOT + '/projects/' + this.get('id') + '?with_phases';
  },
  props: {
    id: 'number',
    name: 'string',
    date_start: 'date',
    calendar_weeks: 'number',
    developer_weeks: 'number'
  },
  collections: {
    phases: Phases
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

    if ('date_start' in attrs) {
      attrs.date_start = new Date(attrs.date_start);
    }

    return attrs;
  }
});
