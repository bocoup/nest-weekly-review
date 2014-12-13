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
    utilization: function() {
      return this.get('utilizations')
        .atDate(this.get('date'), this.get('daynum'));
    },
    // Define a set-able computed property so the utilizations collection can
    // be updated according to the state of a checkbox input.
    uBool: {
      get: function() {
        return !!this.get('utilization');
      },
      set: function(val) {
        var utilizations = this.get('utilizations');
        var date = new Date(
          this.get('date').getTime() + this.get('daynum')*1000*60*60*24
        );

        // Leave the utilization as-is until a new value is selected.
        if (!val) {
          return;
        }

        // TODO: Set this to the current utilization
        utilizations.setAtDate(date, {
          utilization_type_id: 5,
          type: { color: 'aa0000' },
          employee_id: this.get('id'),
          position_id: 1,
          project_id: this.get('phase.project.id')
        });

        // The above `Utilizations#setAtDate` operation may trigger changes in
        // the utilization models that Ractive is unable to detect
        // automatically. This makes it necessary to explicitly instruct
        // Ractive to "dirty check" all the dependencies of the `utilizatins`
        // collection.
        this.update('utilizations');
      }
    }
  }
});
