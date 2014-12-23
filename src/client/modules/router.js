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
    'project/:projectId/phase/:phaseId/date/:date/': 'review'
  },

  index: function() {
    var now = new Date();
    var thisWeek = weekNumber.fromDate(now);

    this.phaseList(now.getFullYear(), thisWeek);
  },

  phaseList: function(year, week) {
    this.layout.set('route', 'phaseList');

    this._getProjects(new Date());

    this.layout.findComponent('bp-phase-table').set({
      firstWeek: weekNumber.toDate(year, week),
      numWeeks: 5,
      projects: this.projects
    });
  },

  /**
   * Fetch project data for all projects that are active during the provided
   * date. Optionally, include projects that are included during a range of
   * dates beyond the provided one.
   *
   * @param {Date} date
   * @param {number} [throughWeeks]
   */
  _getProjects: function(date, throughWeeks) {
    var time = date.getTime();
    var projects = this.projects;

    throughWeeks = throughWeeks || 1;

    return new Promise(function(resolve, reject) {
      // TODO: Only fetch project data that has not previously been fetched,
      // likely encapsulated in an instance method such as
      // `Projects#fetchBetween`.
      projects.fetch({
        // The default behavior of `Collection#fetch` is to fire `add`/`remove`
        // events on a per-module basis. Because Ractive is configured to
        // respond to every such event, this behavior causes unecessary
        // rendering. Use the `reset` flag to avoid triggering individual
        // `add`/`remove` events, instead relying on a single `reset` event to
        // instruct Ractive to re-render views as necessary.
        reset: true,

        data: {
          after: time,
          before: time + throughWeeks * 1000 * 60 * 60 * 24 * 7,
        },
        success: function() {
          resolve(projects);
        },
        error: function(error) {
          reject(error);
        }
      });
    });
  },

  _getProject: function(projectId, date) {
    return this._getProjects(date)
      .then(function(projects) {
        return projects.get(projectId);
      });
  },

  _getPhase: function(project, phaseId) {
    return new Promise(function(resolve, reject) {
        // TODO: Explicitly request the phase with the ID `phaseId` once the
        // API is updated to include employee information in phase-specific
        // responses.
        project.fetchPhases({
          success: function(phases) {
            resolve(phases.get(phaseId));
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

  /**
   * Retrieve all the information necessary to render the "review" page.
   *
   * @param {object} opts
   * @param {number} opts.projectId
   * @param {number} opts.phaseId
   * @param {Date} opts.date
   */
  fetchReviewData: function(opts) {
    var project, phase;

    return this._getProject(opts.projectId, opts.date)
      .then(function(_project) {
        project = _project;

        // "Shallow" phase data is included in the response for projects, but
        // the desired phase must be explicitly fetched in order to get
        // employee IDs (which are necessary for requesting utilization data).
        return this._getPhase(project, opts.phaseId);
      }.bind(this))
      .then(function(_phase) {
        phase = _phase;

        return this._getUtil(phase.employees);
      }.bind(this))
      .then(function() {
        return { project: project, phase: phase };
      });
  },

  review: function(projectId, phaseId, dateStr) {
    var dateParts, date;

    this.layout.set('route', 'review');
    dateParts = dateStr.split('-').map(Number);
    date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

    this.fetchReviewData({
      projectId: parseInt(projectId, 10),
      phaseId: parseInt(phaseId, 10),
      date: date
    }).then(function(models) {
        this.layout.findComponent('bp-review').set({
          date: date,
          phase: models.phase,
          projects: this.projects,
          positions: this.positions,
          utilizationTypes: this.utilizationTypes
        });
      }.bind(this), function(err) {
        this.layout.addError(err);
      }.bind(this));
  }
});
