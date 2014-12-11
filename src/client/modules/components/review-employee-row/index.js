'use strict';
var Ractive = require('ractive/ractive.runtime');

var weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

module.exports = Ractive.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  computed: {
    days: function() {
      var begin = this.get('data-date').getTime();
      var utilizations = this.get('utilizations');

      return weekdays.map(function(name, idx) {
        var date = new Date(begin + idx * 1000 * 60 * 60 * 24);

        return {
          name: name,
          date: date,
          utilization: utilizations.atDate(date)
        };
      });
    }
  },
  components: {
    'bp-phase-day': require('./phase-day')
  }
});
