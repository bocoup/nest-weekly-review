'use strict';
var Ractive = require('ractive/ractive.runtime');

var weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

module.exports = Ractive.extend({
  template: require('./template.html'),
  computed: {
    days: function() {
      var begin = this.get('data-date').getTime();
      //var utilizations = this.get('utilizations');
      //console.log('mike');
      return weekdays.map(function(name, idx) {
        return {
          name: name,
          date: new Date(begin + idx * 1000 * 60 * 60 * 24),
          utilization: null
        };
      });
    }
  },
  components: {
    'bp-phase-day': Ractive.extend({
      template: require('./day.html')
    })
  }
});
