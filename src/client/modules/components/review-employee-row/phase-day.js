'use strict';
var Ractive = require('ractive/ractive.runtime');

module.exports = Ractive.extend({
  template: require('./phase-day.html'),
  computed: {
    style: function() {
      var hex = this.get('utilization.type.color');
      var rgb = [
        hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)
      ].map(function(hex) {
        return parseInt(hex, 16);
      }).join(',');
      return 'background-color: rgba(' + rgb + ',0.5);';
    },
    // Define a set-able computed property so the utilizations collection can
    // be updated as appropriate.
    uBool: {
      get: function() {
        return !!this.get('utilization');
      },
      set: function() {
        var utilizations = this.get('utilizations');
        var date = this.get('date');

        // TODO: Set this to the current utilization
        utilizations.setAtDate(date, {});
      }
    }
  }
});
