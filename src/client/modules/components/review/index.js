'use strict';
var Promise = require('ractive/ractive.runtime').Promise;

var Component = require('../../util/component');

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  partials: {
    fullDate: require('../../partials/full-date.html')
  },
  components: {
    'bp-employee-row': require('../review-employee-row')
  },
  computed: {
    activeProjects: function() {
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
      });
    }
  },
  handleSubmit: function() {
    this.event.original.preventDefault();
    this.submit();
  },

  /**
   * Ensure that the user has explicitly verified each employee's utilization
   * data, then set the `verified` flag on all utilizations for the active
   * week (creating new utilization models at the week boundaries via
   * `Utilizations#verify`), and finally submit the report.
   */
  submit: function() {
    var employeeRows = this.findAllComponents('bp-employee-row');
    var date = this.get('date');
    var allVerified = employeeRows.every(function(employeeRow) {
      return employeeRow.get('verified');
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

      // Verify "silently" to prevent needless thrashing in Ractive. This is
      // valid because the utilization views do not visualize their
      // verification status.
      utilizations.verify(date, 7, { silent: true });

      return utilizations.save();
    });

    Promise.all(verificationRequests).then(function() {
        this.get('review').save();
      }.bind(this),
      function(err) {
        this.fire('error', err);
      }.bind(this));
  }
});
