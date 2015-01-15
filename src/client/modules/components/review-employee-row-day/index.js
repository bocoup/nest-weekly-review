'use strict';
var Component = require('../../util/component');
var hexToRgb = require('../../util/hex-to-rgb');

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
      project_phase_id: isConsulting ? this.get('newPhase.id') : null,
      project: isConsulting ? this.get('newProject') : null
    };
  },

  setAndSave: function(date, values) {
    var utilizations = this.get('utilizations');
    var old = utilizations.atDate(date);
    var current = utilizations.setAtDate(date, values, { silent: true });

    // TODO: Render some sort of progress indicator for the duration of the
    // 'save' operation.
    this.set('utilization', current);

    utilizations.save().then(null, function(err) {
      utilizations.setAtDate(date, old, { silent: true });
      this.set('utilization', old);

      this.fire('error', {
        title: 'Failed to save utilization', desc: err
      });
    }.bind(this));
  },

  handleDragstart: function(event) {
    event._lastDragEnter = event.node;
    this.fire('select', this.get('utilization'));
  },

  handleDragend: function() {
    this.fire('deselect', this.get('utilization'));
  },

  handleDragenter: function(event) {
    if (event.node === event._lastDragEnter) {
      return;
    }
    event._lastDragEnter = event.node;
    this.fire('brush', this, this.get('date'));
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
     * The following `new`-prefixed viewmodel attributes are necessary because
     * each Ractive component is visualizing one day among many in a given
     * Utilization model. Setting attributes on this model directly would
     * also effect neighboring days. Instead, modified attribute state is
     * stored on the view itself. In the `uBool` attribute setter (defined
     * below), this information is retrieved via the `read` method and used to
     * potentially create a *new* Utilization model when `Utilization#save` is
     * called.
     */
    newType: {
      set: function(val) {
        this.set('_newType', val);
      },
      get: function() {
        var newType = this.get('_newType');
        var currentTypeId = this.get('utilization.utilization_type_id');
        var types = this.get('utilizationTypes');

        if (!newType && currentTypeId && types) {
          types.some(function(type) {
            if (type.id === currentTypeId) {
              newType = type;
              return true;
            }
          });
        }

        return newType;
      }
    },

    newPosition: {
      set: function(val) {
        this.set('_newPosition', val);
      },
      get: function() {
        var newPosition = this.get('_newPosition');
        var currentPositionId = this.get('utilization.position_id');
        var positions = this.get('positions');

        if (!newPosition && currentPositionId && positions) {
          positions.some(function(position) {
            if (position.id === currentPositionId) {
              newPosition = position;
              return true;
            }
          });
        }

        return newPosition;
      }
    },

    newProject: {
      set: function(val) {
        this.set('_newProject', val);
      },
      get: function() {
        var newProject = this.get('_newProject');
        var currentProjectId = this.get('utilization.project_id');
        var activeProjects = this.get('activeProjects');
        var type = this.get('newType');

        if (!type || !type.isConsulting) {
          return null;
        }

        if (!newProject && currentProjectId && activeProjects) {
          activeProjects.some(function(project) {
            if (project.id === currentProjectId) {
              newProject = project;
              return true;
            }
          });
        }

        return newProject;
      }
    },

    newPhase: {
      set: function(val) {
        this.set('_newPhase', val);
      },
      get: function() {
        var newPhase = this.get('_newPhase');
        var currentPhaseId = this.get('utilization.project_phase_id');
        var phases = this.get('phases');

        if (!newPhase && currentPhaseId && phases) {
          phases.some(function(phase) {
            if (phase.id === currentPhaseId) {
              newPhase = phase;
              return true;
            }
          });
        }

        return newPhase;
      }
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
        var date = this.get('date');

        // Leave the utilization as-is until a new value is selected.
        if (!val) {
          return;
        }

        this.setAndSave(date, this.read());
      }
    }
  }
});
