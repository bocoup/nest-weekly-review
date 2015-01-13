'use strict';
var Component = require('../../util/component');
var hexToRgb = require('../../util/hex-to-rgb');

// TODO: Initially set `newType`, `newPosition` to the associated value for the
// current day.

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),

  read: function() {
    var type = this.get('newType');
    var isConsulting = type.get('isConsulting');

    return {
      utilization_type_id: type.get('id'),
      type: type.toJSON(),
      employee_id: this.get('employee.id'),
      position_id: isConsulting ? this.get('newPosition.id') : 1,
      project_id: isConsulting ? this.get('newProject.id') : 1,
      project: isConsulting ? this.get('newProject') : null
    };
  },

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
        var current;

        // Leave the utilization as-is until a new value is selected.
        if (!val) {
          return;
        }

        // TODO: Set this to the current utilization
        current = utilizations.setAtDate(date, this.read(), { silent: true });

        // TODO: Render some sort of progress indicator for the duration of the
        // 'save' operation.
        this.set('utilization', current);

        utilizations.save().then(null, function(err) {
          this.fire('error', {
            title: 'Failed to save utilization', desc: err
          });
        }.bind(this));
      }
    }
  }
});
