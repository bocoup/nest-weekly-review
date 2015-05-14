'use strict';
var Promise = require('ractive/ractive.runtime').Promise;

var Component = require('../../util/component');
var ordinalSuffix = require('../../util/ordinal-suffix');

var DAY_MS = 1000 * 60 * 60 * 24;
var DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  components: {
    'wr-employee-row': require('../review-employee-row'),
    'week-heading': require('../week-heading')
  },

  data: {
    asOrdinal: function(num) {
      return num + ordinalSuffix(num);
    }
  },

  computed: {
    weekDays: function() {
      var sunday = this.get('date').getTime();

      return DAY_NAMES.map(function(name, idx) {
        return {
          name: name,
          date: new Date(sunday + (idx + 1) * DAY_MS)
        };
      });
    },
    allPhaseHref: function() {
      return '/date/' +
        this.get('date').toISOString().replace(/T.*$/, '') + '/';
    },
    previousWeekHref: function() {
      var previousWeek = this.offsetWeek(-1);

      if (!previousWeek) {
        return null;
      }

      return this.weekHref(previousWeek);
    },
    nextWeekHref:  function() {
      var nextWeek = this.offsetWeek(1);

      if (!nextWeek) {
        return null;
      }

      return this.weekHref(nextWeek);
    },

    /**
     * Build an array of projects that may be valid for the current review:
     *
     * - All projects for the current review's active phases
     * - All projects that have no phase
     */
    projects: function() {
      return this.get('activePhases').map(function(phase) {
        return phase.project;
      }).filter(function(project, until, projects) {
        var idx;

        for (idx = 0; idx < until; ++idx) {
          if (projects[idx].id === project.id) {
            return false;
          }
        }

        return true;
      }).concat(this.get('phaselessProjects').models)
      .sort(function(a, b) {
        var aName = a.get('name').toLowerCase();
        var bName = b.get('name').toLowerCase();
        return aName < bName ? -1 : 1;
      });
    }
  },

  handleSubmit: function() {
    this.event.original.preventDefault();
    this.submit();
  },

  weekHref: function(date) {
    return '/date/' + date.toISOString().replace(/T.*$/, '') +
      '/phase/' + this.get('phase.id') + '/';
  },

  offsetWeek: function(offset) {
    var current = this.get('date');
    var phase = this.get('phase');
    var otherWeek;

    if (!phase) {
      return null;
    }

    otherWeek = new Date(+current + 1000 * 60 * 60 * 24 * 7 * offset);

    if (!phase.contains(otherWeek)) {
      return null;
    }

    return otherWeek;
  },

  /**
   * Ensure that the user has explicitly verified each employee's utilization
   * data, then set the `verified` flag on all utilizations for the active
   * week (creating new utilization models at the week boundaries via
   * `Utilizations#verify`), and finally submit the report.
   */
  submit: function() {
    var employeeRows = this.findAllComponents('wr-employee-row');
    var allVerified = employeeRows.every(function(employeeRow) {
      return employeeRow.isVerified();
    });
    var verificationRequests;

    if (!allVerified) {
      this.fire(
        'error',
        'Please verify utilizations for all employees before submitting ' +
          'the review.'
      );
      return;
    }

    verificationRequests = this.get('phase.employees').map(function(employee) {
      var utilizations = employee.get('utilizations');

      return utilizations.save();
    });

    Promise.all(verificationRequests).then(function() {
        return this.get('review').save();
      }.bind(this)).then(function() {
          this.fire('notice', 'Review successfully submitted! Way to go!');
        }.bind(this), function(err) {
          this.fire('error', err);
        }.bind(this));
  }
});
