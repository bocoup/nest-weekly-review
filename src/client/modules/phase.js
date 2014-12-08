'use strict';
var Model = require('ampersand-model');

var WEEK_MS = 1000 * 60 * 60 * 24 * 7;

module.exports = Model.extend({
  props: {
    id: 'number',
    date_start: 'date',
    name: 'string',
    calendar_weeks: 'number',
    developer_weeks: 'number',
    project: 'object'
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
  }
});
