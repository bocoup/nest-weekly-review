'use strict';
var Router = require('ampersand-router');
var Promise = require('ractive/ractive.runtime').Promise;
var AmpersandAdaptor = require('ractive-adaptors-ampersand');

var Phases = require('./models/phases');
var Projects = require('./models/projects');
var UtilizationTypes = require('./models/utilization-types');
var Review = require('./models/phase-review');

var Layout = require('./components/layout/index');
var weekNumber = require('./util/week-num');
var token = require('./util/token');

module.exports = Router.extend({
  initialize: function(options) {
    this.layout = new Layout({
      el: options.el,
      adapt: [AmpersandAdaptor]
    });
    this.phases = new Phases();
    this.phaselessProjects = new Projects();
    this.utilizationTypes = new UtilizationTypes();

    this.asyncRoute(/date\/(\d{4})-(\d\d)-(\d\d)\//i, 'phaseList');
    this.asyncRoute(/date\/(\d{4})-(\d\d)-(\d\d)\/phase\/(\d+)\//i, 'review');
    this.asyncRoute('', 'index');
    this.route('logout/', 'logout');

    if (!token.get()) {
      return;
    }

    /**
    * Fetch all projects which do not have a phase. These will be appended
    * to the list of possible projects on a phase review, allowing for
    * correcting entries to be made
    */
    this.phaselessProjects.fetch({
      data: {
        active: true,
        hasPhase: false,
        include: ['organization']
      },
      error: function (model, response) {
        this.layout.addError({
          title: 'Couldn\'t fetch projects without phases.',
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
    if (!token.get()) {
      return;
    }

    return Router.prototype.execute.apply(this, arguments);
  },

  /**
   * Attach a route for some asynchronous functionality.
   *
   * @param {string|RegExp} pattern URL pattern that should activate this route
   * @param {string} name identifier to use when triggering `route` events
   * @param {Function} [callback] the route handler. If unspecified, the method
   *                              defined on the `name` property of the current
   *                              router will be used.
   */
  asyncRoute: function(pattern, name, callback) {
    var wrappedCallback;

    if (!callback) {
      callback = this[name];
    }

    wrappedCallback = function() {
      var clearLoading = this.layout.set.bind(this.layout, 'isLoading', false);

      this.layout.set('isLoading', true);

      callback.apply(this, arguments)
        .then(clearLoading, clearLoading);
    }.bind(this);

    this.route(pattern, name, wrappedCallback);
  },

  index: function() {
    var now = new Date();
    return this.phaseList(
      now.getFullYear(), now.getMonth() + 1, now.getDate()
    );
  },

  phaseList: function(year, month, day) {
    var numWeeks = 5;
    var sunday = weekNumber.sundayOf(new Date(year, month - 1, day));

    return this.getPhases(sunday, numWeeks)
      .then(function() {
        this.layout.set('route', 'phaseList');

        this.layout.set({
          firstWeek: sunday,
          numWeeks: numWeeks,
          phases: this.phases
        });
      }.bind(this));
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
    var beforeDate, afterDate;

    throughWeeks = throughWeeks || 1;

    afterDate = new Date(
      date.getTime() - date.getDay() * 1000 * 60 * 60 * 24
    );
    beforeDate = new Date(
      afterDate.getTime() + throughWeeks * 1000 * 60 * 60 * 24 * 7
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
          after: afterDate.toISOString().replace(/T.*$/, ''),
          before: beforeDate.toISOString().replace(/T.*$/, ''),
          include: ['reviews', 'project', 'employees', 'project.organization']
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
   * @param {Object} opts
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

  review: function(year, month, day, phaseId) {
    var date = new Date(year, month - 1, day);

    return this.fetchReviewData({
        phaseId: parseInt(phaseId, 10),
        date: date
      }).then(function(models) {
          var review = models.phase.reviewAt(date) || new Review({
            week_number: models.phase.weekOffset(date),
            project_phase_id: models.phase.get('id')
          });

          this.layout.set({
            route: 'review',
            activePhases: models.phases,
            date: date,
            phase: models.phase,
            phaselessProjects: this.phaselessProjects,
            review: review,
            utilizationTypes: this.utilizationTypes
          });
        }.bind(this), function(err) {
          this.layout.addError(err);
        }.bind(this));
  },

  logout: function() {
    token.unset();
    window.location = '/';
  }
});
