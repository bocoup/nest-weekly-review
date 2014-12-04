'use strict';
var Ractive = require('ractive/ractive.runtime');

var DAY_MS = 24 * 60 * 60 * 1000;

module.exports = Ractive.extend({
  template: require('./template.html'),
  data: {
    firstWeek: new Date(),
    numWeeks: 0
  },
  computed: {
    weekRange: function() {
      var first = this.get('firstWeek');
      var num = this.get('numWeeks');
      var weeks = [first];
      var idx;

      for (idx = 1; idx < num; ++idx) {
        weeks.push(new Date(first.getTime() + idx * 7 * DAY_MS));
      }

      return weeks;
    }
  }
});
