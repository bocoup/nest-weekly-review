'use strict';
var Ractive = require('ractive/ractive.runtime');

module.exports = Ractive.extend({
  template: require('./template.html'),
  computed: {
    ut: function() {
      var utilizations = this.get('utilizations');
      var sunday = this.get('data-date');
      var days = [1, 2, 3, 4, 5].map(function(offset) {
        return new Date(sunday.getTime() + offset * 1000 * 60 * 60 * 24);
      }).map(function(date) {
        var ut;

        utilizations.forEach(function(utilization) {
          if (utilization.includes(date)) {
            ut = utilization;
          }
        });

        return ut;
      });

      return days;
    }
  }
});
