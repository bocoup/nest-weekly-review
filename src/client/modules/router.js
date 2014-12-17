'use strict';
var Router = require('ampersand-router');
var Promise = require('ractive/ractive.runtime').Promise;

var Projects = require('./models/projects');
var Positions = require('./models/positions');
var UtilizationTypes = require('./models/utilization-types');
var Layout = require('./components/layout/index');
var weekNumber = require('./util/week-num');

require('./ractive-adaptors-backbone');

module.exports = Router.extend({
  initialize: function(options) {
    this.layout = new Layout({
      el: options.el,
      adapt: ['Backbone']
    });
    this.projects = new Projects();
    this.positions = new Positions();
    this.utilizationTypes = new UtilizationTypes();

    this.positions.fetch({
      error: function(model, response) {
        this.layout.addError({
          title: 'Couldn\'t fetch position data',
          description: response.body
        });
      }.bind(this)
    });

    this.utilizationTypes.fetch({
      error: function(model, response) {
        this.layout.addError({
          title: 'Couldn\'t fetch utilization type data',
          description: response.body
        });
      }.bind(this)
    });
  },

  routes: {
    '': 'index',
    'year/:year/week/:week/': 'phaseList',
    'project/:projectId/phase/:phaseId/week/:weekOffset/': 'review'
  },

  index: function() {
    var now = new Date();
    var thisWeek = weekNumber.fromDate(now);

    this.phaseList(now.getFullYear(), thisWeek);
  },

  phaseList: function(year, week) {
    this.layout.set('route', 'phaseList');

    // TODO: Fetch with date range, and only when the range includes dates that
    // have not previously been fetched.
    if (!this.hasFetched) {
      this.projects.fetch({
        // The default behavior of `Collection#fetch` is to fire `add`/`remove`
        // events on a per-module basis. Because Ractive is configured to
        // respond to every such event, this behavior causes unecessary
        // rendering. Use the `reset` flag to avoid triggering individual
        // `add`/`remove` events, instead relying on a single `reset` event to
        // instruct Ractive to re-render views as necessary.
        reset: true
      });
      this.hasFetched = true;
    }
    this.layout.findComponent('bp-phase-table').set({
      firstWeek: weekNumber.toDate(year, week),
      numWeeks: 5,
      projects: this.projects
    });
  },

  _getProject: function(projectId) {
    return new Promise(function(resolve, reject) {
        this.projects.getOrFetch(projectId, function(err, project) {
          if (err) {
            reject(new Error('Couldn\'t find project with ID ' + projectId));
            return;
          }

          resolve(project);
        });
      }.bind(this));
  },

  _getPhase: function(project, phaseId) {
    return new Promise(function(resolve, reject) {
        // TODO: Explicitly request the phase with the ID `phaseId` once the
        // API is updated to include employee information in phase-specific
        // responses.
        project.phases.fetch({
          success: function(phases) {
            resolve( phases.get(phaseId));
          },
          error: function() {
            reject(new Error('Couldn\'t find phase with ID ' + phaseId));
          }
        });
      });
  },

  _getUtil: function(employees) {
    return new Promise(function(resolve, reject) {
        employees.fetchUtilizations({
          success: function(employees) {
            resolve(employees);
          },
          error: function(err) {
            reject(err);
          }
        });
      });
  },

  getWeek: function(projectId, phaseId) {
    var project, phase;

    return this._getProject(projectId)
      .then(function(_project) {
        project = _project;

        return this._getPhase(project, phaseId);
      }.bind(this))
      .then(function(_phase) {
        phase = _phase;

        return this._getUtil(phase.employees);
      }.bind(this))
      .then(function() {
        return { project: project, phase: phase };
      });
  },

  review: function(projectId, phaseId, weekOffset) {
    this.layout.set('route', 'review');

    this.getWeek(parseInt(projectId, 10), parseInt(phaseId, 10))
      .then(function(models) {
        this.layout.findComponent('bp-review').set({
          weekOffset: parseInt(weekOffset, 10),
          phase: models.phase,
          projects: models.project,
          positions: this.positions,
          utilizationTypes: this.utilizationTypes
        });
      }.bind(this), function(err) {
        this.layout.addError(err);
      }.bind(this));
  }
});
