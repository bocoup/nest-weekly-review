'use strict';
var Component = require('../../util/component');
var hexToRgb = require('../../util/hex-to-rgb');

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  computed: {
    style: function() {
      var hex = this.get('utilization.type.color');
      return 'background-color: rgba(' + hexToRgb(hex) + ',0.5);';
    },
    // TODO: Derive these values from data fetched from the server.
    types: function() {
      return [
        { id: 5, name: 'Vacation Time', color: 'b424ff' },
        { id: 1, name: 'Consulting', color: '48d800' }
      ];
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
          utilization_type_id: this.get('newType.id'),
          type: this.get('newType'),
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
