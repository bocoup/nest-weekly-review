'use strict';
var Moment = require('moment');

var Component = require('../../util/component');
var hexToRgb = require('../../util/hex-to-rgb');

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),

  oninit: function() {
    this.set('newProjectId', this.get('utilization.project.id'));
    this.set('newLeaveRequestId', this.get('utilization.leave_request_type_id'));
    this.set('newInitiativeId', this.get('utilization.initiative_id'));
    this.set('newBillable', this.get('utilization.billable'));
    this.observe('newProjectId', this.handleNewProjectIdChange);

    // Ensure that whenever the `utilization` attribute is updated directly (as
    // in this view's `setAndSave` method), the view's `projectId` is likewise
    // updated).
    this.observe('utilization', function() {
      this.set('newProjectId', this.get('utilization.project.id'));
    });
  },

  read: function() {
    var type = this.get('newType');
    var leaveRequestTypeId = this.get('newLeaveRequestType.id');
    var initiative = this.get('newInitiative');

    return {
      utilization_type_id: type.get('id'),
      leave_request_type_id: leaveRequestTypeId || null,
      initiative_id: initiative.get('id'),
      type: type.toJSON()['utilization-types'],
      initiative: initiative.toJSON().initiatives,
      employee_id: this.get('employee.id'),
      project_id: this.get('newProject.id'),
      project_phase_id: this.get('newPhase.id'),
      project: this.get('newProject'),
      billable: this.get('newBillable')
    };
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
    // The phase should be un-set whenever the project changes
    if (id) {
      this.set('newPhase', null);
    }
  },

  computed: {
    style: function() {
      var hex = this.get('utilization.type.color');
      return 'background-color: rgba(' + hexToRgb(hex) + ',0.5);';
    },
    date: function() {
      return new Moment(this.get('weekStart'))
        .startOf('day')
        .add(this.get('dayNum'), 'days')
        .toDate();
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

    newLeaveRequestType: {
      set: function(val) {
        this.set('_newLeaveRequestType', val);
      },
      get: function() {
        var newLeaveRequestType = this.get('_newLeaveRequestType');
        var currentLeaveRequestId = this.get('utilization.leave_request_type_id');
        var leaveRequestTypes = this.get('leaveRequestTypes');

        if (!newLeaveRequestType && currentLeaveRequestId && leaveRequestTypes) {
          leaveRequestTypes.some(function(leaveRequestType) {
            if (leaveRequestType.id === currentLeaveRequestId) {
              newLeaveRequestType = leaveRequestType;
              return true;
            }
          });
        }

        return newLeaveRequestType;
      }
    },

    newInitiative: {
      set: function(val) {
        this.set('_newInitiative', val);
      },
      get: function() {
        var newInitiative = this.get('_newInitiative');
        var currentInitiativeId = this.get('utilization.initiative_id');
        var initiatives = this.get('initiatives');

        if (!newInitiative && currentInitiativeId && initiatives) {
          initiatives.some(function(initiative) {
            if (initiative.id === currentInitiativeId) {
              newInitiative = initiative;
              return true;
            }
          });
        }

        return newInitiative;
      }
    },

    newProject: function() {
      var projects = this.get('projects');
      var newId = this.get('newProjectId');
      var project;

      if (!newId) {
        return null;
      }

      if (projects) {
        projects.some(function(_project) {
          if (_project.id === newId) {
            project = _project;
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

    newBillable: {
      set: function(val) {
        this.set('_newBillable', val);
      },
      get: function() {
        var newBillable = this.get('_newBillable');
        return newBillable;
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

        this.fire('set', this, date, this.read());
      }
    }
  }
});
