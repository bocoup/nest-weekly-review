'use strict';
var Router = require('ampersand-router');
var Promise = require('ractive/ractive.runtime').Promise;

var Phases = require('./models/phases');
var Positions = require('./models/positions');
var UtilizationTypes = require('./models/utilization-types');
var Review = require('./models/phase-review');

var Layout = require('./components/layout/index');
var weekNumber = require('./util/week-num');
var getToken = require('./util/get-token');

require('./ractive-adaptors-backbone');

module.exports = Router.extend({
  initialize: function(options) {
    this.layout = new Layout({
      el: options.el,
      adapt: ['Backbone']
    });
    this.phases = new Phases();
    this.positions = new Positions();
    this.utilizationTypes = new UtilizationTypes();

    if (!getToken()) {
      return;
    }

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

  // Effectively disable the router if the user is not logged in.
  execute: function() {
    if (!getToken()) {
      return;
    }

    return Router.prototype.execute.apply(this, arguments);
  },

  routes: {
    '': 'index',
    'year/:year/week/:week/': 'phaseList',
    'phase/:phaseId/date/:date/': 'review'
  },

  index: function() {
    var time = weekNumber.fromDate(new Date());

    this.phaseList(time.year, time.week);
  },

  phaseList: function(year, week) {
    var numWeeks = 5;

    this.layout.set('route', 'phaseList');

    this.getPhases(new Date(), numWeeks);

    this.layout.findComponent('bp-phase-table').set({
      firstWeek: weekNumber.toDate(year, week),
      numWeeks: numWeeks,
      phases: this.phases
    });
  },

  /**
   * Fetch phase data for all projects that are active during the provided
   * date. Optionally, include projects that are included during a range of
   * dates beyond the provided one.
   *
   * @param {Date} date
   * @param {number} [throughWeeks]
   */
  getPhases: function(date, throughWeeks) {
    var phases = this.phases;
    var beforeDate;

    throughWeeks = throughWeeks || 1;

    beforeDate = new Date(
      date.getTime() + throughWeeks * 1000 * 60 * 60 * 24 * 7
    );

    return new Promise(function(resolve, reject) {
      // TODO: Only fetch project data that has not previously been fetched,
      // likely encapsulated in an instance method such as
      // `Projects#fetchBetween`.
      phases.fetch({
        // The default behavior of `Collection#fetch` is to fire `add`/`remove`
        // events on a per-module basis. Because Ractive is configured to
        // respond to every such event, this behavior causes unecessary
        // rendering. Use the `reset` flag to avoid triggering individual
        // `add`/`remove` events, instead relying on a single `reset` event to
        // instruct Ractive to re-render views as necessary.
        reset: true,

        data: {
          after: date.toISOString().replace(/T.*$/, ''),
          before: beforeDate.toISOString().replace(/T.*$/, ''),
          include: ['reviews', 'project', 'employees']
        },
        success: function() {
          resolve(phases);
        },
        error: function(error) {
          reject(error);
        }
      });
    });
  },

  getPhase: function(phaseId) {
    return new Promise(function(resolve, reject) {
        this.phases.getOrFetch(phaseId, function(err, phase) {
          if (err) {
            reject(new Error('Couldn\'t find phase with ID ' + phaseId));
            return;
          }

          resolve(phase);
        });
      }.bind(this));
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
   * @param {number} opts.phaseId
   * @param {Date} opts.date
   */
  fetchReviewData: function(opts) {
    return this.getPhases(opts.date)
      .then(function(phases) {
        var phase = phases.get(opts.phaseId);

        return this._getUtil(phase.employees).then(function() {
          return { phase: phase, phases: phases };
        });
      }.bind(this));
  },

  review: function(phaseId, dateStr) {
    var dateParts, date;

    this.layout.set('route', 'review');
    dateParts = dateStr.split('-').map(Number);
    date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

    this.fetchReviewData({
      phaseId: parseInt(phaseId, 10),
      date: date
    }).then(function(models) {
        var review = models.phase.reviewAt(date) || new Review({
          first_day: date,
          project_phase_id: models.phase.get('id')
        });

        this.layout.findComponent('bp-review').set({
          date: date,
          phase: models.phase,
          review: review,
          activePhases: models.phases,
          positions: this.positions,
          utilizationTypes: this.utilizationTypes
        });
      }.bind(this), function(err) {
        this.layout.addError(err);
      }.bind(this));
  }
});
