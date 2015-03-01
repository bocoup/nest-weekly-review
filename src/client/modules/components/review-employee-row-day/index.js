'use strict';
var Component = require('../../util/component');
var hexToRgb = require('../../util/hex-to-rgb');

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),

  oninit: function() {
    this.observe('newProjectId', this.handleNewProjectIdChange);
  },

  read: function() {
    var type = this.get('newType');
    var projectRequired = type.get('project_required');

    return {
      utilization_type_id: type.get('id'),
      type: type.toJSON()['utilization-types'],
      employee_id: this.get('employee.id'),
      project_id: projectRequired ? this.get('newProject.id') : 1,
      project_phase_id: projectRequired ? this.get('newPhase.id') : null,
      project: projectRequired ? this.get('newProject') : null
    };
  },

  setAndSave: function(date, values) {
    var utilizations = this.get('utilizations');
    var old = utilizations.atDate(date);
    var current = utilizations.setAtDate(date, values, { silent: true });

    this.set('isSaving', true);

    utilizations.save().then(function() {
        this.set('isSaving', false);
        this.set('utilization', current);
      }.bind(this), function(err) {
        this.set('isSaving', false);
        utilizations.setAtDate(date, old, { silent: true });
        this.set('utilization', old);

        this.fire('error', {
          title: 'Failed to save utilization', desc: err
        });
      }.bind(this));
  },

  handleDragstart: function() {
    var event = this.event;

    // Required to enable element dragging in Firefox:
    event.original.dataTransfer.setData('text/plain', 'This element may be dragged');

    event._lastDragEnter = event.node;
    this.fire('select', this.get('utilization'));
  },

  handleDragend: function() {
    this.fire('deselect', this.get('utilization'));
  },

  handleDragenter: function() {
    var event = this.event;
    if (event.node === event._lastDragEnter) {
      return;
    }
    event._lastDragEnter = event.node;
    this.fire('brush', this, this.get('date'));
  },

  handleNewProjectIdChange: function(id) {
    // The new project ID should default to the value of the current
    // utilization's project.
    if (!id) {
      this.set('newProjectId', this.get('utilization.project.id'));

    // The phase should be un-set whenever the project changes
    } else {
      this.set('newPhase', null);
    }
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

    newProject: function() {
      var activeProjects = this.get('activeProjects');
      var phaselessProjects = this.get('phaselessProjects');
      var newId = this.get('newProjectId');
      var project;

      if (activeProjects) {
        activeProjects.some(function(activeProject) {
          if (activeProject.id === newId) {
            project = activeProject;
            return true;
          }
        });
      }

      if (phaselessProjects) {
        phaselessProjects.some(function(phaselessProject) {
          if (phaselessProject.id === newId) {
            project = phaselessProject;
            return true;
          }
        });
      }

      return project || this.get('utilization.project');
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
