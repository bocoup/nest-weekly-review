'use strict';
var Ractive = require('ractive/ractive.runtime');

var WEEK_MS = 1000 * 60 * 60 * 24 * 7;

module.exports = Ractive.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  components: {
    'bp-employee-row': require('../review-employee-row')
  },
  computed: {
    date: function() {
      var start = this.get('phase.date_start');
      var weekOffset = this.get('weekOffset');

      if (!start || weekOffset === undefined) {
        return start;
      }

      return new Date(start.getTime() + WEEK_MS * weekOffset);
    }
  }
});
