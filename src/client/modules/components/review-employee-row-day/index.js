'use strict';
var Component = require('../../util/component');
var hexToRgb = require('../../util/hex-to-rgb');

// TODO: Initially set `newType`, `newPosition` to the associated value for the
// current day.

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  computed: {
    style: function() {
      var hex = this.get('utilization.type.color');
      return 'background-color: rgba(' + hexToRgb(hex) + ',0.5);';
    },
    date: function() {
      var offset = this.get('dayNum') * 1000* 60 * 60 * 24;

      return new Date(this.get('weekStart').getTime() + offset);
    },

    /**
     * Infer the valid phases for the currently-selected project by iterating
     * through all active phases, filtering out any phases that belong to
     * another project.
     */
    phases: function() {
      var newProject = this.get('newProject');

      if (!newProject) {
        return [];
      }

      return this.get('activePhases').filter(function(phase) {
        return phase.project.id === newProject.id;
      });
    },

    /**
     * Define a set-able computed property so the utilizations collection can
     * be updated according to the state of a checkbox input.
     */
    uBool: {
      get: function() {
        return !!this.get('utilization');
      },
      set: function(val) {
        var utilizations = this.get('utilizations');
        var date = this.get('date');
        var type = this.get('newType');
        var current;

        // Leave the utilization as-is until a new value is selected.
        if (!val) {
          return;
        }

        if (!type.isConsulting) {
          this.set('newPosition', null);
          this.set('newProject', null);
        }

        // TODO: Set this to the current utilization
        current = utilizations.setAtDate(date, {
          utilization_type_id: this.get('newType.id'),
          type: type,
          employee_id: this.get('id'),
          position_id: this.get('newPosition.id'),
          project_id: this.get('newProject.id'),
          project: this.get('newProject')
        }, { silent: true });

        this.set('utilization', current);

        utilizations.save().then(null, function(err) {
          this.fire('error', err);
        }.bind(this));
      }
    }
  }
});
